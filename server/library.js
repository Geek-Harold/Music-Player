import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseFile } from "music-metadata";

const AUDIO_EXTENSIONS = new Set([".mp3", ".m4a", ".aac", ".flac", ".wav", ".ogg", ".oga", ".opus"]);
// Folders that are never music and can be huge or locked.
const SKIP_DIRS = new Set(["node_modules", "$recycle.bin", "appdata", "system volume information"]);
const DATA_DIR = path.join(import.meta.dirname, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const CACHE_FILE = path.join(DATA_DIR, "library.json");

const readJson = async (file, fallback) => {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch { return fallback; }
};
const writeJson = async (file, value) => {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(file, JSON.stringify(value, null, 2));
};

export const defaultFolders = () => ["Music", "Downloads", path.join("OneDrive", "Music")].map((folder) => path.join(os.homedir(), folder));

export async function getFolders() {
  const settings = await readJson(SETTINGS_FILE, null);
  return settings?.folders ?? defaultFolders();
}

export async function setFolders(folders) {
  const clean = [...new Set(folders.map((folder) => path.resolve(String(folder).trim())).filter(Boolean))];
  await writeJson(SETTINGS_FILE, { folders: clean });
  return clean;
}

export async function describeFolders() {
  const folders = await getFolders();
  return Promise.all(folders.map(async (folder) => ({ path: folder, exists: await stat(folder).then((info) => info.isDirectory(), () => false) })));
}

async function* walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return; }
  for (const entry of entries) {
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name.toLowerCase())) continue;
    const full = path.join(dir, entry.name);
    // Symlinks are skipped on purpose so a link loop can't hang the scan.
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) yield full;
  }
}

async function readTrack(file, info) {
  const name = path.parse(file).name;
  // Untagged files are often named "Artist - Title".
  const [guessArtist, ...rest] = name.split(" - ");
  const base = {
    id: createHash("sha1").update(file.toLowerCase()).digest("hex").slice(0, 16),
    path: file,
    size: info.size,
    mtimeMs: info.mtimeMs,
    title: rest.length ? rest.join(" - ") : name,
    artist: rest.length ? guessArtist : "Unknown artist",
    album: "",
    duration: 0,
    hasCover: false,
  };
  try {
    const { common, format } = await parseFile(file, { skipCovers: false });
    return { ...base, title: common.title || base.title, artist: common.artist || common.albumartist || base.artist, album: common.album ?? "", duration: format.duration ?? 0, hasCover: Boolean(common.picture?.length) };
  } catch {
    return base;
  }
}

let index = null;
let running = null;

async function runSync() {
  const started = Date.now();
  const folders = await getFolders();
  const cached = new Map((await readJson(CACHE_FILE, { tracks: [] })).tracks.map((track) => [track.path, track]));
  const found = new Map();
  let added = 0;
  let updated = 0;
  for (const folder of folders) {
    for await (const file of walk(folder)) {
      if (found.has(file)) continue;
      const info = await stat(file).catch(() => null);
      if (!info) continue;
      const previous = cached.get(file);
      // Unchanged files reuse their cached tags, which keeps re-syncs fast.
      if (previous && previous.size === info.size && previous.mtimeMs === info.mtimeMs) { found.set(file, previous); continue; }
      found.set(file, await readTrack(file, info));
      if (previous) updated += 1;
      else added += 1;
    }
  }
  const removed = [...cached.keys()].filter((file) => !found.has(file)).length;
  const tracks = [...found.values()].sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
  const scannedAt = new Date().toISOString();
  await writeJson(CACHE_FILE, { scannedAt, tracks });
  index = new Map(tracks.map((track) => [track.id, track]));
  return { tracks, scannedAt, added, updated, removed, ms: Date.now() - started };
}

// Concurrent callers share one scan instead of walking the disk twice.
export function syncLibrary() {
  running ??= runSync().finally(() => { running = null; });
  return running;
}

export async function getTrack(id) {
  if (!index) index = new Map((await readJson(CACHE_FILE, { tracks: [] })).tracks.map((track) => [track.id, track]));
  return index.get(id);
}

export async function getCover(track) {
  if (!track.hasCover) return null;
  try {
    const { common } = await parseFile(track.path);
    const picture = common.picture?.[0];
    return picture ? { data: picture.data, format: picture.format } : null;
  } catch {
    return null;
  }
}
