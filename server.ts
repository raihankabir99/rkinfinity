import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { AccessToken } from "livekit-server-sdk";
import { runChat } from "./src/server/chat.server.ts";
import { requireAdmin } from "./src/server/admin-auth.server.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Validate an authenticated Supabase access token and confirm the admin role.
  // This endpoint is a server-verified UI gate; protected tables must still use RLS.
  app.get("/api/admin/session", async (req, res) => {
    const authorization = req.header("authorization") ?? "";
    const match = authorization.match(/^Bearer\\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ authenticated: false, isAdmin: false });
    }

    try {
      const admin = await requireAdmin(match[1]);
      return res.set("Cache-Control", "no-store").json({
        authenticated: true,
        isAdmin: true,
        userId: admin.userId,
      });
    } catch (error) {
      const code = error instanceof Error ? error.message : "ADMIN_ROLE_CHECK_FAILED";
      if (code === "UNAUTHORIZED") {
        return res.status(401).json({ authenticated: false, isAdmin: false });
      }
      if (code === "FORBIDDEN") {
        return res.status(403).json({ authenticated: true, isAdmin: false });
      }
      console.error("Admin session verification failed:", error);
      return res.status(503).json({ authenticated: false, isAdmin: false });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const input = req.body;
      const context = { env: process.env };
      const result = await runChat(input, context);
      res.json({ reply: result.content });
    } catch (e) {
      console.error("Error in server chat endpoint:", e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/livekit/token", async (req, res) => {
    try {
      const room = typeof req.body?.room === "string" ? req.body.room.trim() : "";
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

      if (!room || room.length > 120 || !name || name.length > 80) {
        return res.status(400).json({ error: "A valid room and participant name are required." });
      }

      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;
      const livekitUrl = process.env.LIVEKIT_URL;

      if (!apiKey || !apiSecret || !livekitUrl) {
        console.error("LiveKit server credentials are not configured.");
        return res.status(500).json({ error: "LiveKit is not configured on the server." });
      }

      const identity = `rkInfinity-${crypto.randomUUID()}`;
      const token = new AccessToken(apiKey, apiSecret, {
        identity,
        name,
        ttl: "2h",
      });

      token.addGrant({
        roomJoin: true,
        room,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      return res.json({
        token: await token.toJwt(),
        url: livekitUrl,
        room,
      });
    } catch (e) {
      console.error("Error creating LiveKit token:", e);
      return res.status(500).json({ error: "Unable to create LiveKit access token." });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
