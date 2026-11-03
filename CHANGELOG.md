# Changelog

All notable changes to SONA. Format loosely follows Keep a Changelog.

## [Unreleased]

### Added
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
