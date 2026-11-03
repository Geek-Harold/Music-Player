# SONA Music Player — Learning Notes

## How I work on this project
- Build first, learn by reverse-engineering the finished code
- Every finished piece = one commit
- Every pasted snippet I don't understand gets logged here as a question

## Open Questions (my study syllabus)
- [ ] What does `export default` mean in Sidebar.jsx?
- [ ] What is `{playlists.map((p) => ...)}` doing?
- [ ] Why does CSS live in separate .css files per component?
- [ ] What are CSS variables (`--mauve-dark`) and why use them?
- [ ] What does `display: flex` / `grid` actually do?
- [ ] What does `useState(() => ...)` (a function instead of a value) do in App.jsx?
- [ ] What is "lifting state up", and why does `volume` now live in App.jsx instead of VinylDisc.jsx?

## Done
- [x] Replace emoji/unicode symbols with lucide-react icons
- [x] NowPlaying card (album art, title, controls)
- [x] Vinyl disc animation
- [x] Real audio playback
- [x] Search functionality
- [x] Playlists
- [x] Queue, shuffle, repeat, likes, recently played
- [x] Settings page (playback toggles, volume, clear saved data)

## TODO / Upcoming
- [ ] Back end: serve real tracks + metadata instead of the hard-coded list in `src/data/tracks.js`
- [ ] Replace placeholder audio (SoundHelix samples) and covers (picsum.photos)
- [ ] Front-end polish pass

## Things I learned
- `npm create vite@latest . -- --template react` scaffolds a React app in the current folder
- `git add . && git commit -m "..." && git push` saves work to GitHub
- A locked folder can't be moved — close VS Code first!
- Only one dev server can use a port: if 5173 is busy, run `npx vite --port 5180`
