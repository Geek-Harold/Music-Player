import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import ProfileCard from "./components/ProfileCard";
import PlaylistCover from "./components/PlaylistCover";
import PlaylistDialog from "./components/PlaylistDialog";
import NowPlaying from "./components/NowPlaying";
import RecentlyPlayed from "./components/RecentlyPlayed";
import Trending from "./components/Trending";
import PlayerBar from "./components/PlayerBar";
import Settings from "./components/Settings";
import useAudio from "./hooks/useAudio";
import { playlist as sampleTracks } from "./data/tracks";
import { ListMusic, Plus, Search, X, Disc3, Play } from "lucide-react";

const readSaved = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
};
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

const syncLibrary = async () => {
  const response = await fetch("/api/sync", { method: "POST" });
  if (!response.ok) throw new Error(`Sync failed (${response.status})`);
  return response.json();
};

// Syncs the local music folders every time the app opens, then hands the
// result to the player. Falls back to the sample tracks if nothing is found.
export default function App() {
  const [library, setLibrary] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const resync = useCallback(async () => {
    setSyncing(true);
    try { setLibrary({ ...(await syncLibrary()), online: true }); }
    catch { setLibrary((current) => current ?? { tracks: [], folders: [], online: false }); }
    finally { setSyncing(false); }
  }, []);
  const saveFolders = useCallback(async (folders) => {
    const response = await fetch("/api/folders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folders }) });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? "Could not save folders.");
    await resync();
  }, [resync]);
  useEffect(() => {
    let cancelled = false;
    syncLibrary().then((result) => { if (!cancelled) setLibrary({ ...result, online: true }); }, () => { if (!cancelled) setLibrary({ tracks: [], folders: [], online: false }); });
    return () => { cancelled = true; };
  }, []);

  if (!library) return <div className="splash" role="status"><Disc3 size={44} className="splash-disc" /><p className="splash-logo">SONA</p><p>Syncing your music…</p></div>;
  return <MusicPlayer tracks={library.tracks.length ? library.tracks : sampleTracks} library={library} syncing={syncing} onResync={resync} onSaveFolders={saveFolders} />;
}

function MusicPlayer({ tracks, library, syncing, onResync, onSaveFolders }) {
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
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [profile, setProfile] = useState(() => readSaved("sona:profile", { name: "Listener", color: "#b98a99", createdAt: new Date().toISOString() }));
  const [volume, setVolume] = useState(() => {
    const saved = Number(localStorage.getItem("sona:volume") ?? NaN);
    return Number.isFinite(saved) && saved >= 0 && saved <= 1 ? Math.round(saved * 100) : 70;
  });
  const track = tracks.find((item) => item.id === currentId) ?? tracks[0];

  useEffect(() => { localStorage.setItem("sona:likes", JSON.stringify(likedIds)); }, [likedIds]);
  useEffect(() => { localStorage.setItem("sona:recent", JSON.stringify(recentIds)); }, [recentIds]);
  useEffect(() => { localStorage.setItem("sona:playlists", JSON.stringify(customPlaylists)); }, [customPlaylists]);
  useEffect(() => { localStorage.setItem("sona:volume", String(volume / 100)); }, [volume]);
  useEffect(() => { localStorage.setItem("sona:profile", JSON.stringify(profile)); }, [profile]);
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
  const createPlaylist = ({ name, description, trackIds }) => {
    const created = { id: `playlist-${Date.now()}`, name, description, trackIds, createdAt: new Date().toISOString() };
    setCustomPlaylists((items) => [...items, created]);
    setCreatingPlaylist(false);
    openPlaylist(created.id);
  };
  const playlistTracks = (list) => list.trackIds.map((id) => tracks.find((item) => item.id === id)).filter(Boolean);
  const playAll = (list) => {
    if (!list.length) return;
    pickTrack(list[0].id);
    setQueue(list.slice(1).map((item) => item.id));
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
    if (activeView === "Playlist") return (customPlaylists.find((list) => list.id === activePlaylist)?.trackIds ?? []).map((id) => tracks.find((item) => item.id === id)).filter(Boolean);
    return tracks;
  }, [activeView, activePlaylist, customPlaylists, likedIds, query, recentIds, tracks]);
  const currentIndex = tracks.findIndex((item) => item.id === currentId);
  const comingUp = Array.from({ length: tracks.length - 1 }, (_, offset) => tracks[(currentIndex + offset + 1) % tracks.length]);
  const heading = (eyebrow, title, count) => <header className="view-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{count !== undefined && <span className="track-count">{count} {count === 1 ? "track" : "tracks"}</span>}</header>;
  const trackList = (list, emptyTitle, emptyText) => list.length ? <div className="library-list">{list.map((item) => <div className={`library-row ${item.id === currentId ? "current" : ""}`} key={item.id}><button className="row-main" onClick={() => pickTrack(item.id)}><img src={item.cover} alt="" /><span><strong>{item.title}</strong><small>{item.artist}</small></span></button><span className="row-duration">{item.duration}</span>{activeView === "Playlist" && !query.trim() ? <button className="icon-button" aria-label={`Remove ${item.title} from playlist`} onClick={() => removeFromPlaylist(activePlaylist, item.id)}><X size={17} /></button> : <button className="icon-button" aria-label={`Add ${item.title} to queue`} onClick={() => addToQueue(item.id)}><Plus size={18} /></button>}</div>)}</div> : <section className="empty-state"><ListMusic size={32} /><h2>{emptyTitle}</h2><p>{emptyText}</p></section>;

  const renderView = () => {
    if (playerOpen) return <NowPlaying track={track} audio={audio} liked={likedIds.includes(currentId)} onLike={toggleLike} onSkipForward={skipForward} onSkipBack={skipBack} onToggleShuffle={() => setShuffle((value) => !value)} onToggleRepeat={() => setRepeat((value) => !value)} shuffle={shuffle} repeat={repeat} queueTracks={queue.map((id, index) => ({ item: tracks.find((song) => song.id === id), index })).filter(({ item }) => item)} comingUp={comingUp} onPlay={pickTrack} onRemoveFromQueue={(index) => setQueue((items) => items.filter((_, i) => i !== index))} onClose={() => setPlayerOpen(false)} />;
    if (query.trim()) return <>{heading("SEARCH", `Results for “${query.trim()}”`, viewTracks.length)}{trackList(viewTracks, "No matching tracks", "Try another title or artist.")}</>;
    if (activeView === "Home") return <>{heading(library.tracks.length ? `SONA · ${library.tracks.length} TRACKS${library.added ? ` · ${library.added} NEW` : ""}` : "SONA", `${greeting()}, ${profile.name}`)}{!library.tracks.length && <div className="library-notice"><p>{library.online ? "No music found in your folders, so you're hearing sample tracks." : "The library server isn't running, so you're hearing sample tracks. Start the app with npm run dev."}</p>{library.online && <button onClick={() => navigate("Settings")}>Choose folders</button>}</div>}<RecentlyPlayed title={recentTracks.length ? "Listen again" : "Start listening"} tracks={recentTracks.length ? recentTracks : tracks} onPlay={pickTrack} /><Trending title="Quick picks" tracks={tracks} onPlay={pickTrack} onQueue={addToQueue} /></>;
    if (activeView === "Browse") return <>{heading("SONA LIBRARY", "Browse", tracks.length)}<Trending title="All tracks" tracks={tracks} onPlay={pickTrack} onQueue={addToQueue} /></>;
    if (activeView === "Charts") return <>{heading("SONA LIBRARY", "Charts")}<Trending title="Top tracks" tracks={tracks} onPlay={pickTrack} onQueue={addToQueue} ranked /></>;
    if (activeView === "Settings") return <>{heading("SONA", "Settings")}<Settings library={library} syncing={syncing} onResync={onResync} onSaveFolders={onSaveFolders} shuffle={shuffle} repeat={repeat} onToggleShuffle={() => setShuffle((value) => !value)} onToggleRepeat={() => setRepeat((value) => !value)} volume={volume} onVolumeChange={setVolume} counts={{ recent: recentIds.length, likes: likedIds.length, playlists: customPlaylists.length }} onClearHistory={() => setRecentIds([])} onClearLikes={() => setLikedIds([])} onClearPlaylists={() => { setCustomPlaylists([]); setActivePlaylist(null); }} /></>;
    if (activeView === "Collection") return <>{heading("SONA LIBRARY", "Collection")}<section className="shelf"><h3 className="section-heading">Playlists</h3><div className="playlist-grid"><button className="playlist-tile playlist-tile-new" onClick={() => setCreatingPlaylist(true)}><span className="playlist-new-art"><Plus size={36} /></span><strong>New playlist</strong><small>Name it, then pick songs</small></button>{customPlaylists.map((item) => { const count = playlistTracks(item).length; return <button className="playlist-tile" key={item.id} onClick={() => openPlaylist(item.id)}><PlaylistCover tracks={playlistTracks(item)} /><strong>{item.name}</strong><small>{count} {count === 1 ? "track" : "tracks"}</small></button>; })}</div></section><section className="shelf"><h3 className="section-heading">Liked tracks</h3>{trackList(viewTracks, "Nothing here yet", "Tap the heart on a playing track to save it here.")}</section></>;
    if (activeView === "Recently Played") return <>{heading("SONA LIBRARY", "Recently Played", viewTracks.length)}{trackList(viewTracks, "Nothing here yet", "Tracks you play will show up here.")}</>;
    const list = customPlaylists.find((item) => item.id === activePlaylist);
    return <><header className="playlist-hero"><PlaylistCover tracks={viewTracks} className="hero-cover" /><div className="hero-text"><p className="eyebrow">PLAYLIST</p><h1>{list?.name ?? "Playlist"}</h1>{list?.description && <p className="hero-description">{list.description}</p>}<p className="track-count">{profile.name} · {viewTracks.length} {viewTracks.length === 1 ? "track" : "tracks"}</p><button className="hero-play" disabled={!viewTracks.length} onClick={() => playAll(viewTracks)}><Play size={18} fill="currentColor" /> Play</button></div></header>{trackList(viewTracks, "Nothing here yet", "Add songs to this playlist to see them here.")}<div className="suggestions"><button className="suggestions-toggle" onClick={() => setShowPlaylistSuggestions((value) => !value)}><h2>{showPlaylistSuggestions ? "Choose tracks" : "Add tracks"}</h2><Plus size={18} /></button>{showPlaylistSuggestions && tracks.filter((item) => !list?.trackIds.includes(item.id)).map((item) => <div className="library-row" key={item.id}><span className="row-label"><strong>{item.title}</strong><small>{item.artist}</small></span><button className="icon-button" aria-label={`Add ${item.title} to playlist`} onClick={() => addToPlaylist(activePlaylist, item.id)}><Plus size={18} /></button></div>)}</div></>;
  };

  return (
    <div className={`app ${playerOpen ? "player-open" : ""}`}>
      <Sidebar activeView={playerOpen || query.trim() ? null : activeView} activePlaylist={activePlaylist} playlists={customPlaylists} onNavigate={navigate} onOpenPlaylist={openPlaylist} onNewPlaylist={() => setCreatingPlaylist(true)} />
      <main className="content">
        <div className="topbar"><button className="topbar-logo" onClick={() => navigate("Home")} aria-label="SONA home">SONA</button><label className="search-wrap"><Search size={18} /><input className="search" type="search" placeholder="Search songs or artists" value={query} onChange={(event) => { setQuery(event.target.value); setPlayerOpen(false); }} />{query && <button className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}</label><ProfileCard profile={profile} onSave={setProfile} stats={{ tracks: tracks.length, likes: likedIds.length, playlists: customPlaylists.length }} onNavigate={navigate} onSync={library.online ? onResync : null} syncing={syncing} /></div>
        <div className="view">{renderView()}</div>
      </main>
      <PlayerBar track={track} audio={audio} liked={likedIds.includes(currentId)} onLike={toggleLike} onSkipBack={skipBack} onSkipForward={skipForward} shuffle={shuffle} repeat={repeat} onToggleShuffle={() => setShuffle((value) => !value)} onToggleRepeat={() => setRepeat((value) => !value)} volume={volume} onVolumeChange={setVolume} expanded={playerOpen} onToggleExpanded={() => setPlayerOpen((value) => !value)} />
      <audio ref={audioRef} {...audio.handlers} preload="metadata" />
      {creatingPlaylist && <PlaylistDialog tracks={tracks} existingNames={customPlaylists.map((item) => item.name)} onCreate={createPlaylist} onClose={() => setCreatingPlaylist(false)} />}
    </div>
  );
}
