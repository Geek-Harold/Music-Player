import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { describeFolders, getCover, getTrack, setFolders, syncLibrary } from "./library.js";

const PORT = Number(process.env.PORT) || 5181;
const DIST = path.join(import.meta.dirname, "..", "dist");

const formatDuration = (seconds) => {
  if (!seconds) return "";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
};
// The browser never sees file paths, only ids it can hand back.
const toClient = (track) => ({
  id: track.id,
  title: track.title,
  artist: track.artist,
  album: track.album,
  duration: formatDuration(track.duration),
  rpm: "33 RPM",
  cover: `/api/tracks/${track.id}/cover`,
  src: `/api/tracks/${track.id}/audio`,
});
const escapeXml = (text) => text.replace(/[<>&"']/g, (char) => `&#${char.charCodeAt(0)};`);
const placeholderCover = (track) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b98a99"/><stop offset="1" stop-color="#4a3348"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/><circle cx="150" cy="150" r="96" fill="#2e2530" opacity=".85"/><circle cx="150" cy="150" r="34" fill="#e8c46a"/><text x="150" y="162" text-anchor="middle" font-family="Georgia,serif" font-size="34" font-weight="700" fill="#2e2530">${escapeXml((track.title[0] ?? "♪").toUpperCase())}</text></svg>`;

const app = express();
app.use(express.json());

app.post("/api/sync", async (_req, res, next) => {
  try {
    const result = await syncLibrary();
    console.log(`Library synced: ${result.tracks.length} tracks (${result.added} new, ${result.updated} changed, ${result.removed} removed) in ${result.ms}ms`);
    res.json({ ...result, tracks: result.tracks.map(toClient), folders: await describeFolders() });
  } catch (error) { next(error); }
});

app.get("/api/folders", async (_req, res) => res.json({ folders: await describeFolders() }));

app.put("/api/folders", async (req, res) => {
  const folders = req.body?.folders;
  if (!Array.isArray(folders) || folders.some((folder) => typeof folder !== "string" || !path.isAbsolute(folder.trim()))) {
    return res.status(400).json({ error: "Send folders as a list of full paths, like C:\\Users\\you\\Music." });
  }
  await setFolders(folders);
  res.json({ folders: await describeFolders() });
});

app.get("/api/tracks/:id/audio", async (req, res) => {
  const track = await getTrack(req.params.id);
  if (!track) return res.sendStatus(404);
  // sendFile handles Range requests, which the <audio> element needs for seeking.
  res.sendFile(track.path, { dotfiles: "allow" }, (error) => { if (error && !res.headersSent) res.sendStatus(404); });
});

app.get("/api/tracks/:id/cover", async (req, res) => {
  const track = await getTrack(req.params.id);
  if (!track) return res.sendStatus(404);
  const cover = await getCover(track);
  res.set("Cache-Control", "max-age=86400");
  if (cover) return res.type(cover.format).send(Buffer.from(cover.data));
  res.type("image/svg+xml").send(placeholderCover(track));
});

// `npm start` serves the built app from the same port.
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(DIST, "index.html")));
}

// The scan runs when the app opens (POST /api/sync), not here, so the
// "new tracks" count the app shows is measured from the last time you looked.
app.listen(PORT, "127.0.0.1", () => console.log(`SONA library server on http://127.0.0.1:${PORT}`));
