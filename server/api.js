import path from "node:path";
import { describeFolders, getCover, getTrack, setFolders, syncLibrary } from "./library.js";

// The library API without a transport: the Express server (server/index.js) and the
// desktop app (electron/main.js) both answer the same /api routes with these.

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
  // Raw numbers for sorting: length in seconds, and when the file was last saved (≈ when you added it).
  seconds: Math.round(track.duration || 0),
  addedAt: Math.round(track.mtimeMs || 0),
  rpm: "33 RPM",
  cover: `/api/tracks/${track.id}/cover`,
  src: `/api/tracks/${track.id}/audio`,
});
const escapeXml = (text) => text.replace(/[<>&"']/g, (char) => `&#${char.charCodeAt(0)};`);
const placeholderCover = (track) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b98a99"/><stop offset="1" stop-color="#4a3348"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/><circle cx="150" cy="150" r="96" fill="#2e2530" opacity=".85"/><circle cx="150" cy="150" r="34" fill="#e8c46a"/><text x="150" y="162" text-anchor="middle" font-family="Georgia,serif" font-size="34" font-weight="700" fill="#2e2530">${escapeXml((track.title[0] ?? "♪").toUpperCase())}</text></svg>`;

export async function sync() {
  const result = await syncLibrary();
  console.log(`Library synced: ${result.tracks.length} tracks (${result.added} new, ${result.updated} changed, ${result.removed} removed) in ${result.ms}ms`);
  return { ...result, tracks: result.tracks.map(toClient), folders: await describeFolders() };
}

export const listFolders = async () => ({ folders: await describeFolders() });

// Returns null when the input isn't a list of full paths.
export async function saveFolders(folders) {
  if (!Array.isArray(folders) || folders.some((folder) => typeof folder !== "string" || !path.isAbsolute(folder.trim()))) return null;
  await setFolders(folders);
  return listFolders();
}
export const FOLDERS_ERROR = "Send folders as a list of full paths, like C:\\Users\\you\\Music.";

export const audioPath = async (id) => (await getTrack(id))?.path ?? null;

// The embedded album art, or a generated placeholder; null for an unknown track.
export async function cover(id) {
  const track = await getTrack(id);
  if (!track) return null;
  const art = await getCover(track);
  if (art) return { type: art.format, body: Buffer.from(art.data) };
  return { type: "image/svg+xml", body: Buffer.from(placeholderCover(track)) };
}
