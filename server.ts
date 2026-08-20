import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface ServerState {
  version: number;
  lastUpdated: number;
  teams: any[];
  players: any[];
  matches: any[];
  tournamentInfo: any;
  adminPin: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tournament_state.json");

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create data dir:", err);
  }
}

// In-Memory Global State
let globalState: ServerState = {
  version: 1,
  lastUpdated: Date.now(),
  teams: [],
  players: [],
  matches: [],
  tournamentInfo: null,
  adminPin: "1234",
};

// Load saved state from disk on startup
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      globalState = {
        version: parsed.version || 1,
        lastUpdated: parsed.lastUpdated || Date.now(),
        teams: parsed.teams || [],
        players: parsed.players || [],
        matches: parsed.matches || [],
        tournamentInfo: parsed.tournamentInfo || null,
        adminPin: parsed.adminPin || "1234",
      };
      console.log(`[STATE] Loaded state from disk with version ${globalState.version}`);
    }
  }
} catch (err) {
  console.error("Error reading saved tournament_state.json:", err);
}

// Persist state to disk safely
function saveStateToDisk() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(globalState, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save state to disk:", err);
  }
}

// Active Server-Sent Events (SSE) clients for instant real-time broadcasts to all users
const sseClients = new Set<express.Response>();

function broadcastSSE(data: ServerState, senderId?: string) {
  const payload = JSON.stringify({ ...data, senderId: senderId || "server" });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Max body limit for base64 images and tournament data
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      version: globalState.version,
      connectedClients: sseClients.size,
      timestamp: new Date().toISOString(),
    });
  });

  // 📡 Real-time SSE Stream: Instant push when admin changes live scores, players, etc.
  app.get("/api/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable proxy buffering

    // Send initial snapshot immediately
    const initialPayload = JSON.stringify({ ...globalState, senderId: "initial_sync" });
    res.write(`data: ${initialPayload}\n\n`);

    sseClients.add(res);

    // Keep connection alive with periodic heartbeats
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(": heartbeat\n\n");
      } catch {
        clearInterval(heartbeatInterval);
        sseClients.delete(res);
      }
    }, 15000);

    req.on("close", () => {
      clearInterval(heartbeatInterval);
      sseClients.delete(res);
    });
  });

  // 📥 Get Current Global State
  app.get("/api/state", (req, res) => {
    const clientVersion = Number(req.query.v);
    if (!isNaN(clientVersion) && clientVersion === globalState.version) {
      return res.json({ changed: false, version: globalState.version });
    }
    res.json({ changed: true, ...globalState });
  });

  // 📤 Sync Updates from Admin (Score changes, match events, players, clubs, notices)
  app.post("/api/sync", (req, res) => {
    const { teams, players, matches, tournamentInfo, adminPin, senderId } = req.body;

    let hasChanges = false;
    if (teams !== undefined) {
      globalState.teams = teams;
      hasChanges = true;
    }
    if (players !== undefined) {
      globalState.players = players;
      hasChanges = true;
    }
    if (matches !== undefined) {
      globalState.matches = matches;
      hasChanges = true;
    }
    if (tournamentInfo !== undefined) {
      globalState.tournamentInfo = tournamentInfo;
      hasChanges = true;
    }
    if (adminPin !== undefined) {
      globalState.adminPin = adminPin;
      hasChanges = true;
    }

    if (hasChanges) {
      globalState.version += 1;
      globalState.lastUpdated = Date.now();
      saveStateToDisk();
      broadcastSSE(globalState, senderId);
    }

    res.json({
      success: true,
      version: globalState.version,
      lastUpdated: globalState.lastUpdated,
      connectedClients: sseClients.size,
    });
  });

  // Vite middleware for development or Static Serving in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // In Express v5, wildcard route requires '*all'
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

