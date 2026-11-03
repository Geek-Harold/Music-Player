# Changelog

All notable changes to SONA. Format loosely follows Keep a Changelog.

## [Unreleased]

### Added
- Refresh-proof session: the current song and exact position, queue, play context and shuffle order, the open page or playlist, search text and whether the full player is open are saved and restored (paused at the saved spot) after a refresh or reopening the tab
- Repeat modes: the loop button cycles Off → All → One (with a "1" icon and an active dot). Off stops after the last song, All wraps around, One loops the current song. Settings has an Off/All/One selector
- Proper shuffle: a Fisher–Yates play order where every song plays once per lap, starting from the current song; Previous walks back through the same order; each new lap is reshuffled without repeating the last song
- Play context: songs play within the list you picked them from (a playlist, search results, liked tracks…), shown as "Playing from …" in Up next, which now lists the real upcoming order
- Playlist pages have a Shuffle button next to Play; shuffle and repeat settings are remembered
- Profile card: the top-bar avatar opens a card with your name, colour, "listening since" date, track/liked/playlist counts and shortcuts (collection, history, settings, sync). Name and colour are editable and saved in the browser; Home greets you by name
- New playlist dialog: title, optional description, and a searchable song picker with a live cover mosaic; checks for empty and duplicate names
- Collection shows playlists as a grid of cover tiles with a "New playlist" tile; playlist pages get a cover, description and a Play button that queues the whole playlist
- Local library sync: an Express server (`server/`) scans music folders each time the app opens, reads tags and cover art with music-metadata, caches results so re-syncs only read new or changed files, and streams audio with seeking support
- Settings → Music folders: see track count and last sync, "Sync now", add or remove folders (defaults: Music, Downloads, OneDrive\Music)
- Startup splash while syncing; sample tracks are used only when no local music is found or the server isn't running
- `npm run dev` now runs the web app (port 5180) and library server (port 5181) together; `npm start` builds and serves everything from the server
- Vite + React project setup
- App layout: 3-column responsive grid (sidebar / content / vinyl)
- Sidebar with nav, playlists, search, user section
- NowPlaying card: album art, track info, progress bar, controls
- Recently Played album grid + Trending ranked list
- CSS-only spinning vinyl with waveform, arc detail, volume control
- Real audio playback: play/pause, seek, skip forward/back, auto-advance
- Like button, album cover art with retro filter
- Responsive breakpoints (vinyl hides ≤1100px, sidebar shrinks ≤820px)
- Queue panel, shuffle, repeat, liked-tracks collection, recently played history
- Search by title or artist, custom playlists, localStorage persistence
- Settings view: shuffle/repeat switches, volume slider, clear history/likes/playlists

### Changed
- Layout reworked to follow YouTube Music conventions:
  - Persistent bottom player bar (controls left, track + like centre, volume/shuffle/repeat/expand right) with a thin seek line along its top
  - Expanded "Now playing" view opened from the bar: album sleeve with the spinning vinyl sliding out, full controls, and an Up next list (queue + coming up)
  - Home is now shelves: a "Listen again" carousel and a "Quick picks" grid; the always-visible vinyl column and queue panel are gone
  - Search moved to a sticky top bar, and the search box now clears properly
  - Sidebar collapses to an icon rail at ≤900px and becomes a bottom tab bar on phones
  - Playlists are also listed (and can be created) from Collection, so they're reachable on phones
- Music no longer starts by itself when the page loads; the first track waits for Play or a track pick
- Volume state moved from VinylDisc into App so Settings can control it (volume is now adjustable on narrow screens where the vinyl panel is hidden)
- README rewritten for SONA; NOTES.md converted to UTF-8 and TODO list updated
- Fonts switched to Cinzel (logo) + Fredoka (body)
- Emoji placeholders replaced with lucide-react icons

### Removed
- Unused mock exports (`currentTrack`, `upNext`, `recentlyPlayed`, `trending`) from `src/data/tracks.js`
