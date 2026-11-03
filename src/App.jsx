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
import { ListMusic, Plus, Search, X, Disc3, Play, Shuffle } from "lucide-react";

const readSaved = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
};
const REPEAT_MODES = ["off", "all", "one"];
const VIEWS = ["Home", "Browse", "Collection", "Recently Played", "Charts", "Settings", "Playlist"];
// Fisher–Yates: every order is equally likely. `first`, if it's in the list, is pinned to the front.
const shuffled = (ids, first) => {
  const rest = ids.filter((id) => id !== first);
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return ids.includes(first) ? [first, ...rest] : rest;
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
  // Where you were last time (song, position, queue, page…), so a refresh picks up where you left off.
  const [session] = useState(() => {
    const saved = readSaved("sona:session", {}) ?? {};
    const known = new Set(tracks.map((item) => item.id));
    const resumesTrack = known.has(saved.currentId);
    return {
      currentId: resumesTrack ? saved.currentId : tracks[0].id,
      position: resumesTrack && Number.isFinite(saved.position) ? saved.position : 0,
      queue: Array.isArray(saved.queue) ? saved.queue.filter((id) => known.has(id)) : [],
      context: saved.context?.label ? { ids: Array.isArray(saved.context.ids) ? saved.context.ids : null, label: saved.context.label } : { ids: null, label: "Your library" },
      shuffleOrder: Array.isArray(saved.shuffleOrder) ? saved.shuffleOrder : null,
      activeView: VIEWS.includes(saved.activeView) ? saved.activeView : "Home",
      activePlaylist: saved.activePlaylist ?? null,
      playerOpen: saved.playerOpen === true,
      query: typeof saved.query === "string" ? saved.query : "",
    };
  });
  const [currentId, setCurrentId] = useState(session.currentId);
  const [likedIds, setLikedIds] = useState(() => readSaved("sona:likes", []));
  const [recentIds, setRecentIds] = useState(() => readSaved("sona:recent", []));
  const [customPlaylists, setCustomPlaylists] = useState(() => readSaved("sona:playlists", []));
  const [queue, setQueue] = useState(session.queue);
  // A saved playlist page only comes back if that playlist still exists.
  const restoresPlaylist = session.activeView !== "Playlist" || customPlaylists.some((item) => item.id === session.activePlaylist);
  const [activeView, setActiveView] = useState(restoresPlaylist ? session.activeView : "Home");
  const [activePlaylist, setActivePlaylist] = useState(restoresPlaylist ? session.activePlaylist : null);
  const [playerOpen, setPlayerOpen] = useState(session.playerOpen);
  const [query, setQuery] = useState(session.query);
  const [shuffle, setShuffle] = useState(() => readSaved("sona:shuffle", false) === true);
  const [repeat, setRepeat] = useState(() => { const saved = readSaved("sona:repeat", "off"); return REPEAT_MODES.includes(saved) ? saved : "off"; });
  // The list playback walks through (null ids = whole library) and its shuffled copy.
  const [context, setContext] = useState(session.context);
  const [shuffleOrder, setShuffleOrder] = useState(() => session.shuffleOrder ?? shuffled(tracks.map((item) => item.id), session.currentId));
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
  useEffect(() => { localStorage.setItem("sona:shuffle", JSON.stringify(shuffle)); }, [shuffle]);
  useEffect(() => { localStorage.setItem("sona:repeat", JSON.stringify(repeat)); }, [repeat]);
  useEffect(() => {
    if (!playerOpen) return;
    const onKey = (event) => { if (event.key === "Escape") setPlayerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playerOpen]);

  const trackById = useMemo(() => new Map(tracks.map((item) => [item.id, item])), [tracks]);
  // Drop ids that a library re-sync removed.
  const contextIds = useMemo(() => (context.ids ?? tracks.map((item) => item.id)).filter((id) => trackById.has(id)), [context, tracks, trackById]);
  const order = useMemo(() => {
    if (!shuffle) return contextIds;
    const inContext = new Set(contextIds);
    const kept = shuffleOrder.filter((id) => inContext.has(id));
    // Songs a re-sync added mid-shuffle join at the end of this lap.
    const seen = new Set(kept);
    return [...kept, ...contextIds.filter((id) => !seen.has(id))];
  }, [shuffle, shuffleOrder, contextIds]);

  const playTrack = (id) => {
    if (!tracks.some((item) => item.id === id)) return;
    setCurrentId(id);
    setRecentIds((items) => [id, ...items.filter((item) => item !== id)].slice(0, 12));
  };
  // What plays next. The queue always goes first; after that we walk the play
  // order (the context list, or its shuffled copy). At the end of the list,
  // repeat-all or a manual skip wraps around; an automatic advance with
  // repeat off stops. Shuffle reshuffles on wrap so each lap is a new order.
  const nextTrack = (automatic = false) => {
    if (queue.length) {
      const [next, ...rest] = queue;
      setQueue(rest);
      return next;
    }
    const at = order.indexOf(currentId);
    if (at === -1) return order[0] ?? null;
    if (at < order.length - 1) return order[at + 1];
    if (automatic && repeat !== "all") return null;
    if (!shuffle) return order[0];
    const lap = shuffled(contextIds);
    // Don't hear the same song twice in a row across laps.
    if (lap.length > 1 && lap[0] === currentId) lap.push(lap.shift());
    setShuffleOrder(lap);
    return lap[0];
  };
  const previousTrack = () => {
    const at = order.indexOf(currentId);
    if (at > 0) return order[at - 1];
    return repeat === "all" ? order.at(-1) : null;
  };
  const { audioRef, ...audio } = useAudio(track, (replay) => {
    const next = nextTrack(true);
    if (next === currentId) replay();
    else if (next) playTrack(next);
  }, repeat === "one", session.position);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume / 100; }, [audioRef, volume]);
  // Saved whenever any of it changes, and again as the page goes away so the
  // exact playback position survives a refresh or closing the tab.
  useEffect(() => {
    const save = () => localStorage.setItem("sona:session", JSON.stringify({ currentId, position: audioRef.current?.currentTime ?? 0, queue, context, shuffleOrder, activeView, activePlaylist, playerOpen, query }));
    const onHide = () => { if (document.visibilityState === "hidden") save(); };
    save();
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHide);
    return () => { window.removeEventListener("pagehide", save); document.removeEventListener("visibilitychange", onHide); };
  }, [audioRef, currentId, queue, context, shuffleOrder, activeView, activePlaylist, playerOpen, query]);
  // Picking a song from a list makes that list the play context, so next,
  // previous and shuffle stay inside it (a playlist, search results, …).
  const pickTrack = (id, list, label) => {
    if (list) {
      const ids = list.map((item) => item.id);
      setContext({ ids, label });
      if (shuffle) setShuffleOrder(shuffled(ids, id));
    }
    // Picking the loaded-but-paused track won't change the id, so start it directly.
    if (id === currentId) audio.play();
    playTrack(id);
  };
  const playFrom = (list, label) => (id) => pickTrack(id, list, label);
  const skipForward = () => {
    const next = nextTrack();
    if (next === currentId) audio.restart();
    else if (next) playTrack(next);
  };
  const skipBack = () => {
    const element = audioRef.current;
    const previous = previousTrack();
    if ((element && element.currentTime > 3) || !previous || previous === currentId) audio.restart();
    else playTrack(previous);
  };
  const toggleShuffle = () => {
    if (!shuffle) setShuffleOrder(shuffled(contextIds, currentId));
    setShuffle(!shuffle);
  };
  const cycleRepeat = () => setRepeat((mode) => REPEAT_MODES[(REPEAT_MODES.indexOf(mode) + 1) % REPEAT_MODES.length]);
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
  // "Play" plays a list in order; "Shuffle" plays it in a fresh random order.
  const playAll = (list, label, shuffleIt = false) => {
    if (!list.length) return;
    const ids = list.map((item) => item.id);
    const lap = shuffleIt ? shuffled(ids) : ids;
    setShuffle(shuffleIt);
    if (shuffleIt) setShuffleOrder(lap);
    setContext({ ids, label });
    if (lap[0] === currentId) audio.play();
    playTrack(lap[0]);
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
  const orderAt = order.indexOf(currentId);
  const upcomingIds = orderAt === -1 ? order : [...order.slice(orderAt + 1), ...(repeat === "all" ? order.slice(0, orderAt) : [])];
  const comingUp = upcomingIds.slice(0, 50).map((id) => trackById.get(id)).filter(Boolean);
  const heading = (eyebrow, title, count) => <header className="view-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{count !== undefined && <span className="track-count">{count} {count === 1 ? "track" : "tracks"}</span>}</header>;
  const trackList = (list, label, emptyTitle, emptyText) => list.length ? <div className="library-list">{list.map((item) => <div className={`library-row ${item.id === currentId ? "current" : ""}`} key={item.id}><button className="row-main" onClick={() => pickTrack(item.id, list, label)}><img src={item.cover} alt="" /><span><strong>{item.title}</strong><small>{item.artist}</small></span></button><span className="row-duration">{item.duration}</span>{activeView === "Playlist" && !query.trim() ? <button className="icon-button" aria-label={`Remove ${item.title} from playlist`} onClick={() => removeFromPlaylist(activePlaylist, item.id)}><X size={17} /></button> : <button className="icon-button" aria-label={`Add ${item.title} to queue`} onClick={() => addToQueue(item.id)}><Plus size={18} /></button>}</div>)}</div> : <section className="empty-state"><ListMusic size={32} /><h2>{emptyTitle}</h2><p>{emptyText}</p></section>;

  const renderView = () => {
    if (playerOpen) return <NowPlaying track={track} audio={audio} liked={likedIds.includes(currentId)} onLike={toggleLike} onSkipForward={skipForward} onSkipBack={skipBack} onToggleShuffle={toggleShuffle} onToggleRepeat={cycleRepeat} shuffle={shuffle} repeat={repeat} queueTracks={queue.map((id, index) => ({ item: tracks.find((song) => song.id === id), index })).filter(({ item }) => item)} comingUp={comingUp} contextLabel={context.label} onPlay={pickTrack} onRemoveFromQueue={(index) => setQueue((items) => items.filter((_, i) => i !== index))} onClose={() => setPlayerOpen(false)} />;
    if (query.trim()) return <>{heading("SEARCH", `Results for “${query.trim()}”`, viewTracks.length)}{trackList(viewTracks, "Search results", "No matching tracks", "Try another title or artist.")}</>;
    if (activeView === "Home") return <>{heading(library.tracks.length ? `SONA · ${library.tracks.length} TRACKS${library.added ? ` · ${library.added} NEW` : ""}` : "SONA", `${greeting()}, ${profile.name}`)}{!library.tracks.length && <div className="library-notice"><p>{library.online ? "No music found in your folders, so you're hearing sample tracks." : "The library server isn't running, so you're hearing sample tracks. Start the app with npm run dev."}</p>{library.online && <button onClick={() => navigate("Settings")}>Choose folders</button>}</div>}<RecentlyPlayed title={recentTracks.length ? "Listen again" : "Start listening"} tracks={recentTracks.length ? recentTracks : tracks} onPlay={playFrom(recentTracks.length ? recentTracks : tracks, recentTracks.length ? "Listen again" : "Your library")} /><Trending title="Quick picks" tracks={tracks} onPlay={playFrom(tracks, "Quick picks")} onQueue={addToQueue} /></>;
    if (activeView === "Browse") return <>{heading("SONA LIBRARY", "Browse", tracks.length)}<Trending title="All tracks" tracks={tracks} onPlay={playFrom(tracks, "Your library")} onQueue={addToQueue} /></>;
    if (activeView === "Charts") return <>{heading("SONA LIBRARY", "Charts")}<Trending title="Top tracks" tracks={tracks} onPlay={playFrom(tracks, "Charts")} onQueue={addToQueue} ranked /></>;
    if (activeView === "Settings") return <>{heading("SONA", "Settings")}<Settings library={library} syncing={syncing} onResync={onResync} onSaveFolders={onSaveFolders} shuffle={shuffle} repeat={repeat} onToggleShuffle={toggleShuffle} onSetRepeat={setRepeat} volume={volume} onVolumeChange={setVolume} counts={{ recent: recentIds.length, likes: likedIds.length, playlists: customPlaylists.length }} onClearHistory={() => setRecentIds([])} onClearLikes={() => setLikedIds([])} onClearPlaylists={() => { setCustomPlaylists([]); setActivePlaylist(null); }} /></>;
    if (activeView === "Collection") return <>{heading("SONA LIBRARY", "Collection")}<section className="shelf"><h3 className="section-heading">Playlists</h3><div className="playlist-grid"><button className="playlist-tile playlist-tile-new" onClick={() => setCreatingPlaylist(true)}><span className="playlist-new-art"><Plus size={36} /></span><strong>New playlist</strong><small>Name it, then pick songs</small></button>{customPlaylists.map((item) => { const count = playlistTracks(item).length; return <button className="playlist-tile" key={item.id} onClick={() => openPlaylist(item.id)}><PlaylistCover tracks={playlistTracks(item)} /><strong>{item.name}</strong><small>{count} {count === 1 ? "track" : "tracks"}</small></button>; })}</div></section><section className="shelf"><h3 className="section-heading">Liked tracks</h3>{trackList(viewTracks, "Liked tracks", "Nothing here yet", "Tap the heart on a playing track to save it here.")}</section></>;
    if (activeView === "Recently Played") return <>{heading("SONA LIBRARY", "Recently Played", viewTracks.length)}{trackList(viewTracks, "Recently played", "Nothing here yet", "Tracks you play will show up here.")}</>;
    const list = customPlaylists.find((item) => item.id === activePlaylist);
    return <><header className="playlist-hero"><PlaylistCover tracks={viewTracks} className="hero-cover" /><div className="hero-text"><p className="eyebrow">PLAYLIST</p><h1>{list?.name ?? "Playlist"}</h1>{list?.description && <p className="hero-description">{list.description}</p>}<p className="track-count">{profile.name} · {viewTracks.length} {viewTracks.length === 1 ? "track" : "tracks"}</p><div className="hero-actions"><button className="hero-play" disabled={!viewTracks.length} onClick={() => playAll(viewTracks, list?.name ?? "Playlist")}><Play size={18} fill="currentColor" /> Play</button><button className="hero-shuffle" disabled={!viewTracks.length} onClick={() => playAll(viewTracks, list?.name ?? "Playlist", true)}><Shuffle size={17} /> Shuffle</button></div></div></header>{trackList(viewTracks, list?.name ?? "Playlist", "Nothing here yet", "Add songs to this playlist to see them here.")}<div className="suggestions"><button className="suggestions-toggle" onClick={() => setShowPlaylistSuggestions((value) => !value)}><h2>{showPlaylistSuggestions ? "Choose tracks" : "Add tracks"}</h2><Plus size={18} /></button>{showPlaylistSuggestions && tracks.filter((item) => !list?.trackIds.includes(item.id)).map((item) => <div className="library-row" key={item.id}><span className="row-label"><strong>{item.title}</strong><small>{item.artist}</small></span><button className="icon-button" aria-label={`Add ${item.title} to playlist`} onClick={() => addToPlaylist(activePlaylist, item.id)}><Plus size={18} /></button></div>)}</div></>;
  };

  return (
    <div className={`app ${playerOpen ? "player-open" : ""}`}>
      <Sidebar activeView={playerOpen || query.trim() ? null : activeView} activePlaylist={activePlaylist} playlists={customPlaylists} onNavigate={navigate} onOpenPlaylist={openPlaylist} onNewPlaylist={() => setCreatingPlaylist(true)} />
      <main className="content">
        <div className="topbar"><button className="topbar-logo" onClick={() => navigate("Home")} aria-label="SONA home">SONA</button><label className="search-wrap"><Search size={18} /><input className="search" type="search" placeholder="Search songs or artists" value={query} onChange={(event) => { setQuery(event.target.value); setPlayerOpen(false); }} />{query && <button className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}</label><ProfileCard profile={profile} onSave={setProfile} stats={{ tracks: tracks.length, likes: likedIds.length, playlists: customPlaylists.length }} onNavigate={navigate} onSync={library.online ? onResync : null} syncing={syncing} /></div>
        <div className="view">{renderView()}</div>
      </main>
      <PlayerBar track={track} audio={audio} liked={likedIds.includes(currentId)} onLike={toggleLike} onSkipBack={skipBack} onSkipForward={skipForward} shuffle={shuffle} repeat={repeat} onToggleShuffle={toggleShuffle} onToggleRepeat={cycleRepeat} volume={volume} onVolumeChange={setVolume} expanded={playerOpen} onToggleExpanded={() => setPlayerOpen((value) => !value)} />
      <audio ref={audioRef} {...audio.handlers} preload="metadata" />
      {creatingPlaylist && <PlaylistDialog tracks={tracks} existingNames={customPlaylists.map((item) => item.name)} onCreate={createPlaylist} onClose={() => setCreatingPlaylist(false)} />}
    </div>
  );
}
