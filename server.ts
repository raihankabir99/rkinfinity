import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { AccessToken } from "livekit-server-sdk";
import { runChat } from "./src/server/chat.server.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
