import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  INITIAL_TEAMS,
  INITIAL_PLAYERS,
  INITIAL_MATCHES,
  INITIAL_TOURNAMENT_INFO,
} from "./src/sampleData";

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

// In-Memory Global State initialized with tournament seed
let globalState: ServerState = {
  version: 1,
  lastUpdated: Date.now(),
  teams: INITIAL_TEAMS,
  players: INITIAL_PLAYERS,
  matches: INITIAL_MATCHES,
  tournamentInfo: INITIAL_TOURNAMENT_INFO,
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
        teams: Array.isArray(parsed.teams) && parsed.teams.length > 0 ? parsed.teams : INITIAL_TEAMS,
        players: Array.isArray(parsed.players) && parsed.players.length > 0 ? parsed.players : INITIAL_PLAYERS,
        matches: Array.isArray(parsed.matches) && parsed.matches.length > 0 ? parsed.matches : INITIAL_MATCHES,
        tournamentInfo: parsed.tournamentInfo || INITIAL_TOURNAMENT_INFO,
        adminPin: parsed.adminPin || "1234",
      };
      console.log(`[STATE] Loaded state from disk with version ${globalState.version}`);
    }
  } else {
    saveStateToDisk();
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

  // CORS middleware for all API routes
  app.use("/api", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

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
    res.setHeader("Access-Control-Allow-Origin", "*");
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
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
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
    if (Array.isArray(teams)) {
      globalState.teams = teams;
      hasChanges = true;
    }
    if (Array.isArray(players)) {
      globalState.players = players;
      hasChanges = true;
    }
    if (Array.isArray(matches)) {
      globalState.matches = matches;
      hasChanges = true;
    }
    if (tournamentInfo !== undefined && tournamentInfo !== null) {
      globalState.tournamentInfo = tournamentInfo;
      hasChanges = true;
    }
    if (typeof adminPin === "string" && adminPin.trim() !== "") {
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

