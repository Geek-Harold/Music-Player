import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Sidebar, { NewPlaylist } from "./components/Sidebar";
import NowPlaying from "./components/NowPlaying";
import RecentlyPlayed from "./components/RecentlyPlayed";
import Trending from "./components/Trending";
import PlayerBar from "./components/PlayerBar";
import Settings from "./components/Settings";
import useAudio from "./hooks/useAudio";
import { playlist as tracks } from "./data/tracks";
import { ListMusic, Plus, Search, X } from "lucide-react";

const readSaved = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
};
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

export default function App() {
  const [currentId, setCurrentId] = useState(tracks[0].id);
  const [likedIds, setLikedIds] = useState(() => readSaved("sona:likes", []));
  const [recentIds, setRecentIds] = useState(() => readSaved("sona:recent", []));
  const [customPlaylists, setCustomPlaylists] = useState(() => readSaved("sona:playlists", []));
  const [queue, setQueue] = useState([]);
  const [activeView, setActiveView] = useState("Home");
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [showPlaylistSuggestions, setShowPlaylistSuggestions] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = Number(localStorage.getItem("sona:volume") ?? NaN);
    return Number.isFinite(saved) && saved >= 0 && saved <= 1 ? Math.round(saved * 100) : 70;
  });
  const track = tracks.find((item) => item.id === currentId) ?? tracks[0];

  useEffect(() => { localStorage.setItem("sona:likes", JSON.stringify(likedIds)); }, [likedIds]);
  useEffect(() => { localStorage.setItem("sona:recent", JSON.stringify(recentIds)); }, [recentIds]);
  useEffect(() => { localStorage.setItem("sona:playlists", JSON.stringify(customPlaylists)); }, [customPlaylists]);
  useEffect(() => { localStorage.setItem("sona:volume", String(volume / 100)); }, [volume]);
  useEffect(() => {
    if (!playerOpen) return;
    const onKey = (event) => { if (event.key === "Escape") setPlayerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playerOpen]);

  const playTrack = (id) => {
    if (!tracks.some((item) => item.id === id)) return;
    setCurrentId(id);
    setRecentIds((items) => [id, ...items.filter((item) => item !== id)].slice(0, 12));
  };
  const nextTrack = () => {
    if (queue.length) {
      const [next, ...rest] = queue;
      setQueue(rest);
      return next;
    }
    if (shuffle && tracks.length > 1) {
      const choices = tracks.filter((item) => item.id !== currentId);
      return choices[Math.floor(Math.random() * choices.length)].id;
    }
    return tracks[(tracks.findIndex((item) => item.id === currentId) + 1) % tracks.length].id;
  };
  const { audioRef, ...audio } = useAudio(track, () => playTrack(nextTrack()), repeat);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume / 100; }, [audioRef, volume]);
  // Picking the loaded-but-paused track won't change the id, so start it directly.
  const pickTrack = (id) => { if (id === currentId) audio.play(); playTrack(id); };
  const skipForward = () => playTrack(nextTrack());
  const skipBack = () => {
    const element = audioRef.current;
    if (element && element.currentTime > 3) audio.restart();
    else playTrack(tracks[(tracks.findIndex((item) => item.id === currentId) - 1 + tracks.length) % tracks.length].id);
  };
  const toggleLike = () => setLikedIds((ids) => ids.includes(currentId) ? ids.filter((id) => id !== currentId) : [...ids, currentId]);
  const addToQueue = (id) => setQueue((items) => [...items, id]);
  const navigate = (view) => { setQuery(""); setActivePlaylist(null); setPlayerOpen(false); setActiveView(view); };
  const openPlaylist = (id) => { setQuery(""); setPlayerOpen(false); setActivePlaylist(id); setActiveView("Playlist"); };
  const createPlaylist = (name) => {
    const cleanName = name.trim();
    if (!cleanName || customPlaylists.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) return;
    const created = { id: `playlist-${Date.now()}`, name: cleanName, trackIds: [] };
    setCustomPlaylists((items) => [...items, created]);
    openPlaylist(created.id);
  };
  const addToPlaylist = (playlistId, id) => setCustomPlaylists((items) => items.map((item) => item.id === playlistId && !item.trackIds.includes(id) ? { ...item, trackIds: [...item.trackIds, id] } : item));
  const removeFromPlaylist = (playlistId, id) => setCustomPlaylists((items) => items.map((item) => item.id === playlistId ? { ...item, trackIds: item.trackIds.filter((trackId) => trackId !== id) } : item));
  const recentTracks = recentIds.map((id) => tracks.find((item) => item.id === id)).filter(Boolean);
  const viewTracks = useMemo(() => {
    if (query.trim()) {
      const term = query.trim().toLowerCase();
      return tracks.filter((item) => `${item.title} ${item.artist}`.toLowerCase().includes(term));
    }
    if (activeView === "Collection") return tracks.filter((item) => likedIds.includes(item.id));
    if (activeView === "Recently Played") return recentIds.map((id) => tracks.find((item) => item.id === id)).filter(Boolean);
    if (activeView === "Playlist") return tracks.filter((item) => customPlaylists.find((list) => list.id === activePlaylist)?.trackIds.includes(item.id));
    return tracks;
  }, [activeView, activePlaylist, customPlaylists, likedIds, query, recentIds]);
  const currentIndex = tracks.findIndex((item) => item.id === currentId);
  const comingUp = Array.from({ length: tracks.length - 1 }, (_, offset) => tracks[(currentIndex + offset + 1) % tracks.length]);
  const heading = (eyebrow, title, count) => <header className="view-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{count !== undefined && <span className="track-count">{count} {count === 1 ? "track" : "tracks"}</span>}</header>;
  const trackList = (list, emptyTitle, emptyText) => list.length ? <div className="library-list">{list.map((item) => <div className={`library-row ${item.id === currentId ? "current" : ""}`} key={item.id}><button className="row-main" onClick={() => pickTrack(item.id)}><img src={item.cover} alt="" /><span><strong>{item.title}</strong><small>{item.artist}</small></span></button><span className="row-duration">{item.duration}</span>{activeView === "Playlist" && !query.trim() ? <button className="icon-button" aria-label={`Remove ${item.title} from playlist`} onClick={() => removeFromPlaylist(activePlaylist, item.id)}><X size={17} /></button> : <button className="icon-button" aria-label={`Add ${item.title} to queue`} onClick={() => addToQueue(item.id)}><Plus size={18} /></button>}</div>)}</div> : <section className="empty-state"><ListMusic size={32} /><h2>{emptyTitle}</h2><p>{emptyText}</p></section>;

  const renderView = () => {
    if (playerOpen) return <NowPlaying track={track} audio={audio} liked={likedIds.includes(currentId)} onLike={toggleLike} onSkipForward={skipForward} onSkipBack={skipBack} onToggleShuffle={() => setShuffle((value) => !value)} onToggleRepeat={() => setRepeat((value) => !value)} shuffle={shuffle} repeat={repeat} queueTracks={queue.map((id, index) => ({ item: tracks.find((song) => song.id === id), index })).filter(({ item }) => item)} comingUp={comingUp} onPlay={pickTrack} onRemoveFromQueue={(index) => setQueue((items) => items.filter((_, i) => i !== index))} onClose={() => setPlayerOpen(false)} />;
    if (query.trim()) return <>{heading("SEARCH", `Results for “${query.trim()}”`, viewTracks.length)}{trackList(viewTracks, "No matching tracks", "Try another title or artist.")}</>;
    if (activeView === "Home") return <>{heading("SONA", greeting())}<RecentlyPlayed title={recentTracks.length ? "Listen again" : "Start listening"} tracks={recentTracks.length ? recentTracks : tracks} onPlay={pickTrack} /><Trending title="Quick picks" tracks={tracks} onPlay={pickTrack} onQueue={addToQueue} /></>;
    if (activeView === "Browse") return <>{heading("SONA LIBRARY", "Browse", tracks.length)}<Trending title="All tracks" tracks={tracks} onPlay={pickTrack} onQueue={addToQueue} /></>;
    if (activeView === "Charts") return <>{heading("SONA LIBRARY", "Charts")}<Trending title="Top tracks" tracks={tracks} onPlay={pickTrack} onQueue={addToQueue} ranked /></>;
    if (activeView === "Settings") return <>{heading("SONA", "Settings")}<Settings shuffle={shuffle} repeat={repeat} onToggleShuffle={() => setShuffle((value) => !value)} onToggleRepeat={() => setRepeat((value) => !value)} volume={volume} onVolumeChange={setVolume} counts={{ recent: recentIds.length, likes: likedIds.length, playlists: customPlaylists.length }} onClearHistory={() => setRecentIds([])} onClearLikes={() => setLikedIds([])} onClearPlaylists={() => { setCustomPlaylists([]); setActivePlaylist(null); }} /></>;
    if (activeView === "Collection") return <>{heading("SONA LIBRARY", "Collection")}<section className="shelf"><h3 className="section-heading">Playlists</h3><div className="chip-row">{customPlaylists.map((item) => <button className="chip" key={item.id} onClick={() => openPlaylist(item.id)}><ListMusic size={15} />{item.name}<small>{item.trackIds.length}</small></button>)}<NewPlaylist className="chip-new" onCreate={createPlaylist} /></div></section><section className="shelf"><h3 className="section-heading">Liked tracks</h3>{trackList(viewTracks, "Nothing here yet", "Tap the heart on a playing track to save it here.")}</section></>;
    if (activeView === "Recently Played") return <>{heading("SONA LIBRARY", "Recently Played", viewTracks.length)}{trackList(viewTracks, "Nothing here yet", "Tracks you play will show up here.")}</>;
    const list = customPlaylists.find((item) => item.id === activePlaylist);
    return <>{heading("PLAYLIST", list?.name ?? "Playlist", viewTracks.length)}{trackList(viewTracks, "Nothing here yet", "Add songs to this playlist to see them here.")}<div className="suggestions"><button className="suggestions-toggle" onClick={() => setShowPlaylistSuggestions((value) => !value)}><h2>{showPlaylistSuggestions ? "Choose tracks" : "Add tracks"}</h2><Plus size={18} /></button>{showPlaylistSuggestions && tracks.filter((item) => !list?.trackIds.includes(item.id)).map((item) => <div className="library-row" key={item.id}><span className="row-label"><strong>{item.title}</strong><small>{item.artist}</small></span><button className="icon-button" aria-label={`Add ${item.title} to playlist`} onClick={() => addToPlaylist(activePlaylist, item.id)}><Plus size={18} /></button></div>)}</div></>;
  };

  return (
    <div className={`app ${playerOpen ? "player-open" : ""}`}>
      <Sidebar activeView={playerOpen || query.trim() ? null : activeView} activePlaylist={activePlaylist} playlists={customPlaylists} onNavigate={navigate} onOpenPlaylist={openPlaylist} onCreatePlaylist={createPlaylist} />
      <main className="content">
        <div className="topbar"><button className="topbar-logo" onClick={() => navigate("Home")} aria-label="SONA home">SONA</button><label className="search-wrap"><Search size={18} /><input className="search" type="search" placeholder="Search songs or artists" value={query} onChange={(event) => { setQuery(event.target.value); setPlayerOpen(false); }} />{query && <button className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}</label><span className="avatar" aria-label="Local library">S</span></div>
        <div className="view">{renderView()}</div>
      </main>
      <PlayerBar track={track} audio={audio} liked={likedIds.includes(currentId)} onLike={toggleLike} onSkipBack={skipBack} onSkipForward={skipForward} shuffle={shuffle} repeat={repeat} onToggleShuffle={() => setShuffle((value) => !value)} onToggleRepeat={() => setRepeat((value) => !value)} volume={volume} onVolumeChange={setVolume} expanded={playerOpen} onToggleExpanded={() => setPlayerOpen((value) => !value)} />
      <audio ref={audioRef} {...audio.handlers} preload="metadata" />
    </div>
  );
}
