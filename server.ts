import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { runChat } from "./src/server/chat.server.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies
  app.use(express.json());

  // API route for Chat
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

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
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
