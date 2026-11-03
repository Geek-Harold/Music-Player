# SONA — Vinyl Music Player

A vinyl-inspired music player built with React 19 and Vite.

## Features
- Real audio playback: play/pause, seek, next/previous, shuffle, repeat, volume
- Spinning vinyl panel that follows playback
- Up-next queue, liked-tracks collection, recently played history
- Search by title or artist
- Custom playlists
- Settings: playback toggles, volume, clear saved data
- Responsive layout for desktop, tablet and phone

Likes, history, playlists and volume are saved in the browser's `localStorage`.

## Getting started
```bash
npm install
npm run dev
```
Then open the URL Vite prints (usually http://localhost:5173). If that port is taken, use `npx vite --port 5180`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure
```
src/
  App.jsx            app state: current track, queue, likes, playlists, views
  components/        Sidebar, NowPlaying, RecentlyPlayed, Trending, VinylDisc, Settings
  hooks/useAudio.js  wraps the <audio> element (play, seek, progress, errors)
  data/tracks.js     track list (placeholder until the back end exists)
```

## Placeholder content
The tracks in `src/data/tracks.js` use sample audio from SoundHelix and random covers from picsum.photos, so an internet connection is needed. They will be replaced once the back end serves real tracks.
