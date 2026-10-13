import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import NowPlaying from "./components/NowPlaying";
import RecentlyPlayed from "./components/RecentlyPlayed";
import Trending from "./components/Trending";
import VinylDisc from "./components/VinylDisc";
import useAudio from "./hooks/useAudio";
import { playlist as tracks } from "./data/tracks";
import { ListMusic, Plus, Play, X } from "lucide-react";

const readSaved = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
};

export default function App() {
  const [currentId, setCurrentId] = useState(tracks[0].id);
  const [likedIds, setLikedIds] = useState(() => readSaved("sona:likes", []));
  const [recentIds, setRecentIds] = useState(() => readSaved("sona:recent", []));
  const [customPlaylists, setCustomPlaylists] = useState(() => readSaved("sona:playlists", []));
  const [queue, setQueue] = useState([]);
  const [activeView, setActiveView] = useState("Now playing");
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [query, setQuery] = useState("");
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [showPlaylistSuggestions, setShowPlaylistSuggestions] = useState(false);
  const track = tracks.find((item) => item.id === currentId) ?? tracks[0];

  useEffect(() => { localStorage.setItem("sona:likes", JSON.stringify(likedIds)); }, [likedIds]);
  useEffect(() => { localStorage.setItem("sona:recent", JSON.stringify(recentIds)); }, [recentIds]);
  useEffect(() => { localStorage.setItem("sona:playlists", JSON.stringify(customPlaylists)); }, [customPlaylists]);

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
  const skipForward = () => playTrack(nextTrack());
  const skipBack = () => {
    const element = audioRef.current;
    if (element && element.currentTime > 3) audio.restart();
    else playTrack(tracks[(tracks.findIndex((item) => item.id === currentId) - 1 + tracks.length) % tracks.length].id);
  };
  const toggleLike = () => setLikedIds((ids) => ids.includes(currentId) ? ids.filter((id) => id !== currentId) : [...ids, currentId]);
  const addToQueue = (id) => setQueue((items) => [...items, id]);
  const createPlaylist = (name) => {
    const cleanName = name.trim();
    if (!cleanName || customPlaylists.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) return;
    const created = { id: `playlist-${Date.now()}`, name: cleanName, trackIds: [] };
    setCustomPlaylists((items) => [...items, created]);
    setActivePlaylist(created.id);
    setActiveView("Playlist");
  };
  const addToPlaylist = (playlistId, id) => setCustomPlaylists((items) => items.map((item) => item.id === playlistId && !item.trackIds.includes(id) ? { ...item, trackIds: [...item.trackIds, id] } : item));
  const removeFromPlaylist = (playlistId, id) => setCustomPlaylists((items) => items.map((item) => item.id === playlistId ? { ...item, trackIds: item.trackIds.filter((trackId) => trackId !== id) } : item));
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

  return (
    <div className="app">
      <Sidebar activeView={activeView} playlists={customPlaylists} onNavigate={(view) => { setQuery(""); setActivePlaylist(null); setActiveView(view); }} onSearch={setQuery} onOpenPlaylist={(id) => { setActivePlaylist(id); setActiveView("Playlist"); setQuery(""); }} onCreatePlaylist={createPlaylist} />
      <main className="content">
        {query.trim() ? <header className="view-heading"><div><p className="eyebrow">SEARCH</p><h1>Results for “{query}”</h1></div><button className="icon-button" aria-label="Clear search" onClick={() => setQuery("")}><X size={18} /></button></header> : activeView === "Now playing" ? <>
          <NowPlaying track={track} upcoming={tracks.find((item) => item.id === queue[0]) ?? tracks[(tracks.findIndex((item) => item.id === currentId) + 1) % tracks.length]} audio={audio} liked={likedIds.includes(currentId)} onLike={toggleLike} onSkipForward={skipForward} onSkipBack={skipBack} onToggleShuffle={() => setShuffle((value) => !value)} onToggleRepeat={() => setRepeat((value) => !value)} shuffle={shuffle} repeat={repeat} onAddToQueue={() => addToQueue(currentId)} />
          <RecentlyPlayed tracks={recentIds.length ? recentIds.map((id) => tracks.find((item) => item.id === id)).filter(Boolean) : tracks} onPlay={playTrack} />
          <Trending tracks={tracks} onPlay={playTrack} onQueue={addToQueue} />
        </> : <>
          <header className="view-heading"><div><p className="eyebrow">SONA LIBRARY</p><h1>{activeView === "Playlist" ? customPlaylists.find((item) => item.id === activePlaylist)?.name ?? "Playlist" : activeView}</h1></div><span className="track-count">{viewTracks.length} {viewTracks.length === 1 ? "track" : "tracks"}</span></header>
          {activeView === "Settings" ? <section className="empty-state"><h2>Playback settings</h2><p>Shuffle and repeat are available from the player controls.</p></section> : activeView === "Browse" || activeView === "Charts" ? <Trending tracks={tracks} onPlay={playTrack} onQueue={addToQueue} /> : viewTracks.length ? <div className="library-list">{viewTracks.map((item) => <div className="library-row" key={item.id}><button className="row-main" onClick={() => playTrack(item.id)}><img src={item.cover} alt="" /><span><strong>{item.title}</strong><small>{item.artist}</small></span></button><span className="row-duration">{item.duration}</span>{activeView === "Playlist" ? <button className="icon-button" aria-label={`Remove ${item.title} from playlist`} onClick={() => removeFromPlaylist(activePlaylist, item.id)}><X size={17} /></button> : <button className="icon-button" aria-label={`Add ${item.title} to queue`} onClick={() => addToQueue(item.id)}><Plus size={18} /></button>}</div>)}</div> : <section className="empty-state"><ListMusic size={32} /><h2>{query ? "No matching tracks" : "Nothing here yet"}</h2><p>{query ? "Try another title or artist." : "Like a track or add songs to this playlist to see them here."}</p></section>}
          {activeView === "Playlist" && <div className="suggestions"><button className="suggestions-toggle" onClick={() => setShowPlaylistSuggestions((value) => !value)}><h2>{showPlaylistSuggestions ? "Choose tracks" : "Add tracks"}</h2><Plus size={18} /></button>{showPlaylistSuggestions && tracks.filter((item) => !customPlaylists.find((list) => list.id === activePlaylist)?.trackIds.includes(item.id)).map((item) => <div className="library-row" key={item.id}><span className="row-label"><strong>{item.title}</strong><small>{item.artist}</small></span><button className="icon-button" aria-label={`Add ${item.title} to playlist`} onClick={() => addToPlaylist(activePlaylist, item.id)}><Plus size={18} /></button></div>)}</div>}
        </>}
      </main>
      <VinylDisc track={track} audio={audio} audioRef={audioRef} />
      <aside className="queue-panel" aria-label="Up next queue"><div className="queue-heading"><h2>Queue</h2><span>{queue.length}</span></div>{queue.length ? queue.map((id, index) => { const item = tracks.find((song) => song.id === id); return <div className="queue-item" key={`${id}-${index}`}><img src={item.cover} alt="" /><span><strong>{item.title}</strong><small>{item.artist}</small></span><button className="icon-button" aria-label={`Remove ${item.title} from queue`} onClick={() => setQueue((items) => items.filter((_, i) => i !== index))}><X size={16} /></button></div>; }) : <p className="queue-empty">Your queue is empty. Add tracks from Browse or Trending.</p>}<button className="queue-current" onClick={() => playTrack(currentId)}><Play size={14} fill="currentColor" /> Playing: {track.title}</button></aside>
      <audio ref={audioRef} {...audio.handlers} preload="metadata" />
    </div>
  );
}
