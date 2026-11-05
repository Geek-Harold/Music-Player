# SONA — Vinyl Music Player

A vinyl-inspired music player for the music on your own computer, built with React 19 and Vite. It runs as a desktop app (Electron) that works fully offline, or in the browser with a small Express server.

## Features
- **Library sync:** every time the app opens it scans your music folders and picks up new, changed and deleted files
- Reads tags and embedded album art (MP3, M4A/AAC, FLAC, WAV, OGG, Opus)
- Real audio playback: play/pause, seek, next/previous, shuffle, repeat, volume
- YouTube Music–style layout: bottom player bar, expanded vinyl player with an Up next list, shelf-based Home
- Up-next queue, liked-tracks collection, recently played history
- Search by title or artist
- Custom playlists
- Settings: music folders, sync now, playback toggles, volume, clear saved data
- Responsive layout for desktop, tablet and phone
- Light, dark or system theme (Settings → Appearance)
- Profile with name, colour and an optional profile picture

Likes, history, playlists, your profile, volume, shuffle/repeat and your listening session (current song and position, queue, open page) are saved in the browser's `localStorage`, so a refresh brings you back to where you were, paused at the same spot.

## Desktop app
```bash
npm install
npm run app
```
`npm run app` builds the interface and opens SONA in its own window. There is no server or port: the app reads your music folders and plays files straight from disk, and works without an internet connection. Your library cache and folder choices are saved in `%APPDATA%\SONA\library`; likes, playlists and the rest are saved in the app itself.

To make an installer, run `npm run dist:win`. It writes `SONA Setup <version>.exe` to `release/`.

## Running in the browser
```bash
npm install
npm run dev
```
Then open http://localhost:5180. `npm run dev` starts two things side by side:
- **web**: the Vite dev server on port 5180
- **api**: the library server on port 5181 (Vite forwards `/api` requests to it)

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the app and the library server with auto-reload |
| `npm start` | Build the app and serve everything from the library server on http://localhost:5181 |
| `npm run server` | Run only the library server |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | Run ESLint |
| `npm run app` | Build and open the desktop app |
| `npm run dist:win` | Build a Windows installer into `release/` |

## Music folders
By default SONA scans `Music`, `Downloads` and `OneDrive\Music` in your user folder, including every folder inside them. You can add or remove folders under **Settings → Music folders**.

The first scan reads each file's tags. After that, results are cached (in the browser version, `server/data/library.json`), so a re-sync only reads files that are new or changed. Folder choices are saved next to it in `settings.json`. In the browser version both files are git-ignored. Delete them to start fresh.

If no music is found, or the library server isn't running, the app falls back to a few sample tracks (these need an internet connection).

## Project structure
```
electron/
  main.js            desktop window; answers the /api routes over sona://app, no server
server/
  api.js             the /api logic, shared by the desktop app and the Express server
  index.js           Express API for the browser version: /api/sync, /api/folders, track audio + cover art
  library.js         folder scanning, tag reading, cache
src/
  App.jsx            syncs the library on open, then app state: current track, queue, likes, playlists, views
  components/        Sidebar, PlayerBar, NowPlaying, RecentlyPlayed, Trending, VinylDisc, Settings
  hooks/useAudio.js  wraps the <audio> element (play, seek, progress, errors)
  data/tracks.js     sample tracks used when no local music is found
```
