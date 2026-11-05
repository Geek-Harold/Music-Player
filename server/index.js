import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { FOLDERS_ERROR, audioPath, cover, listFolders, saveFolders, sync } from "./api.js";

const PORT = Number(process.env.PORT) || 5181;
const DIST = path.join(import.meta.dirname, "..", "dist");

const app = express();
app.use(express.json());

app.post("/api/sync", async (_req, res, next) => {
  try { res.json(await sync()); }
  catch (error) { next(error); }
});

app.get("/api/folders", async (_req, res) => res.json(await listFolders()));

app.put("/api/folders", async (req, res) => {
  const result = await saveFolders(req.body?.folders);
  if (!result) return res.status(400).json({ error: FOLDERS_ERROR });
  res.json(result);
});

app.get("/api/tracks/:id/audio", async (req, res) => {
  const file = await audioPath(req.params.id);
  if (!file) return res.sendStatus(404);
  // sendFile handles Range requests, which the <audio> element needs for seeking.
  res.sendFile(file, { dotfiles: "allow" }, (error) => { if (error && !res.headersSent) res.sendStatus(404); });
});

app.get("/api/tracks/:id/cover", async (req, res) => {
  const art = await cover(req.params.id);
  if (!art) return res.sendStatus(404);
  res.set("Cache-Control", "max-age=86400");
  res.type(art.type).send(art.body);
});

// `npm start` serves the built app from the same port.
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(DIST, "index.html")));
}

// The scan runs when the app opens (POST /api/sync), not here, so the
// "new tracks" count the app shows is measured from the last time you looked.
app.listen(PORT, "127.0.0.1", () => console.log(`SONA library server on http://127.0.0.1:${PORT}`));
