import { BrowserWindow, Menu, app, nativeTheme, protocol, shell } from "electron";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

// SONA as a desktop app: no server or port. The window loads sona://app/, and this
// process answers the same /api routes the Express server does, straight from disk.

// A standard, secure scheme gets a real origin, so localStorage, fetch and media seeking all work.
// It has to be registered before the app is ready, so it comes before the await below.
protocol.registerSchemesAsPrivileged([{ scheme: "sona", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);

// Must happen before the library is first used, so its cache lives in %APPDATA%\SONA.
process.env.SONA_DATA_DIR = path.join(app.getPath("userData"), "library");
const { FOLDERS_ERROR, audioPath, cover, listFolders, saveFolders, sync } = await import("../server/api.js");

const DIST = path.join(import.meta.dirname, "..", "dist");
const ORIGIN = "sona://app";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".json": "application/json", ".woff": "font/woff", ".woff2": "font/woff2" };
const AUDIO_TYPES = { ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".aac": "audio/aac", ".flac": "audio/flac", ".wav": "audio/wav", ".ogg": "audio/ogg", ".oga": "audio/ogg", ".opus": "audio/ogg" };

const json = (value, status = 200) => Response.json(value, { status });

const fileResponse = async (file, type) => {
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return new Response("Not found", { status: 404 });
  return new Response(Readable.toWeb(createReadStream(file)), { headers: { "Content-Type": type, "Content-Length": String(info.size) } });
};

// The <audio> element seeks with Range requests, so answer those with 206 and the asked-for slice.
async function audioResponse(file, range) {
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return new Response("Not found", { status: 404 });
  const headers = { "Content-Type": AUDIO_TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream", "Accept-Ranges": "bytes" };
  const match = /^bytes=(\d*)-(\d*)$/.exec(range ?? "");
  if (!match || (!match[1] && !match[2])) return new Response(Readable.toWeb(createReadStream(file)), { headers: { ...headers, "Content-Length": String(info.size) } });
  // "bytes=-500" means the last 500 bytes.
  const start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
  if (start >= info.size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
  return new Response(Readable.toWeb(createReadStream(file, { start, end })), { status: 206, headers: { ...headers, "Content-Length": String(end - start + 1), "Content-Range": `bytes ${start}-${end}/${info.size}` } });
}

async function handleApi(request, pathname) {
  if (pathname === "/api/sync" && request.method === "POST") return json(await sync());
  if (pathname === "/api/folders" && request.method === "GET") return json(await listFolders());
  if (pathname === "/api/folders" && request.method === "PUT") {
    const result = await saveFolders((await request.json().catch(() => null))?.folders);
    return result ? json(result) : json({ error: FOLDERS_ERROR }, 400);
  }
  const [, id, kind] = /^\/api\/tracks\/([^/]+)\/(audio|cover)$/.exec(pathname) ?? [];
  if (kind === "audio") {
    const file = await audioPath(id);
    return file ? audioResponse(file, request.headers.get("Range")) : new Response("Not found", { status: 404 });
  }
  if (kind === "cover") {
    const art = await cover(id);
    return art ? new Response(art.body, { headers: { "Content-Type": art.type, "Cache-Control": "max-age=86400" } }) : new Response("Not found", { status: 404 });
  }
  return json({ error: "Not found" }, 404);
}

async function handleRequest(request) {
  const { pathname } = new URL(request.url);
  try {
    if (pathname.startsWith("/api/")) return await handleApi(request, decodeURIComponent(pathname));
    // Built files from dist/; anything that isn't one falls back to index.html.
    const file = path.join(DIST, path.normalize(decodeURIComponent(pathname)));
    const inDist = file.startsWith(DIST + path.sep) && path.extname(file);
    return inDist && TYPES[path.extname(file)] && (await stat(file).catch(() => null))?.isFile()
      ? fileResponse(file, TYPES[path.extname(file)])
      : fileResponse(path.join(DIST, "index.html"), TYPES[".html"]);
  } catch (error) {
    console.error(error);
    return json({ error: "Something went wrong." }, 500);
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 380,
    minHeight: 560,
    title: "SONA",
    // Matches the page background so the window doesn't flash white before it paints.
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#1c161d" : "#f0e9de",
    show: false,
    autoHideMenuBar: true,
    webPreferences: { sandbox: true, contextIsolation: true },
  });
  window.once("ready-to-show", () => window.show());
  // Links to the web open in the normal browser, never inside SONA.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => { if (!url.startsWith(ORIGIN)) event.preventDefault(); });
  window.loadURL(`${ORIGIN}/`);
}

// A second launch focuses the open window instead of starting another player.
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => {
    const [window] = BrowserWindow.getAllWindows();
    if (window) { if (window.isMinimized()) window.restore(); window.focus(); }
  });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    protocol.handle("sona", handleRequest);
    createWindow();
    app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
  });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
}
