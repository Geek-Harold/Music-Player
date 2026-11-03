import { useState } from "react";
import "./Settings.css";
import { Shuffle, Repeat, Volume2, VolumeX, Trash2, RefreshCw, Folder, FolderX, Plus, X } from "lucide-react";

export default function Settings({ library, syncing, onResync, onSaveFolders, shuffle, repeat, onToggleShuffle, onToggleRepeat, volume, onVolumeChange, counts, onClearHistory, onClearLikes, onClearPlaylists }) {
  const [newFolder, setNewFolder] = useState("");
  const [folderError, setFolderError] = useState("");
  const confirmThen = (message, action) => () => { if (window.confirm(message)) action(); };
  const folders = library.folders ?? [];
  const saveFolders = async (paths) => {
    setFolderError("");
    try { await onSaveFolders(paths); return true; }
    catch (error) { setFolderError(error.message); return false; }
  };
  const addFolder = async (event) => {
    event.preventDefault();
    const path = newFolder.trim();
    if (!path || folders.some((folder) => folder.path.toLowerCase() === path.toLowerCase())) return;
    if (await saveFolders([...folders.map((folder) => folder.path), path])) setNewFolder("");
  };
  const syncedAt = library.scannedAt ? new Date(library.scannedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  const resets = [
    { label: "Listening history", detail: `${counts.recent} recent ${counts.recent === 1 ? "track" : "tracks"}`, disabled: !counts.recent, onClick: confirmThen("Clear your listening history?", onClearHistory) },
    { label: "Liked tracks", detail: `${counts.likes} in your collection`, disabled: !counts.likes, onClick: confirmThen("Remove every track from your collection?", onClearLikes) },
    { label: "Playlists", detail: `${counts.playlists} ${counts.playlists === 1 ? "playlist" : "playlists"}`, disabled: !counts.playlists, onClick: confirmThen("Delete all of your playlists?", onClearPlaylists) },
  ];
  return (
    <div className="settings">
      <section className="settings-card"><h2>Music folders</h2><p className="muted">{library.online ? "SONA scans these folders (and everything inside them) each time it opens." : "The library server isn't running. Start the app with npm run dev to sync your music."}</p>
        {library.online && <>
          <div className="settings-row"><span className="settings-label"><RefreshCw size={18} /><span><strong>{library.tracks.length} {library.tracks.length === 1 ? "track" : "tracks"}</strong><small>{syncing ? "Syncing…" : syncedAt ? `Last synced ${syncedAt}${library.added ? ` · ${library.added} new` : ""}${library.removed ? ` · ${library.removed} removed` : ""}` : "Not synced yet"}</small></span></span><button className="settings-action" disabled={syncing} onClick={onResync}><RefreshCw size={15} className={syncing ? "spin" : ""} /> Sync now</button></div>
          {folders.map((folder) => <div className="settings-row" key={folder.path}><span className="settings-label">{folder.exists ? <Folder size={18} /> : <FolderX size={18} />}<span><strong className="folder-path">{folder.path}</strong><small>{folder.exists ? "Included" : "Folder not found"}</small></span></span><button className="icon-button" aria-label={`Stop scanning ${folder.path}`} disabled={syncing} onClick={() => saveFolders(folders.filter((item) => item.path !== folder.path).map((item) => item.path))}><X size={16} /></button></div>)}
          <form className="settings-row folder-form" onSubmit={addFolder}><input aria-label="Folder path" placeholder="Add a folder, e.g. D:\Music" value={newFolder} onChange={(event) => setNewFolder(event.target.value)} /><button className="settings-action" disabled={syncing || !newFolder.trim()}><Plus size={15} /> Add</button></form>
          {folderError && <p className="folder-error" role="alert">{folderError}</p>}
        </>}
      </section>
      <section className="settings-card"><h2>Playback</h2>
        <div className="settings-row"><span className="settings-label"><Shuffle size={18} /><span><strong>Shuffle</strong><small>Pick the next track at random</small></span></span><button className={`switch ${shuffle ? "on" : ""}`} role="switch" aria-checked={shuffle} aria-label="Shuffle" onClick={onToggleShuffle}><span /></button></div>
        <div className="settings-row"><span className="settings-label"><Repeat size={18} /><span><strong>Repeat</strong><small>Loop the current track</small></span></span><button className={`switch ${repeat ? "on" : ""}`} role="switch" aria-checked={repeat} aria-label="Repeat" onClick={onToggleRepeat}><span /></button></div>
        <div className="settings-row"><span className="settings-label">{volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}<span><strong>Volume</strong><small>{volume}%</small></span></span><input className="settings-volume" type="range" min="0" max="100" value={volume} aria-label="Volume" onChange={(event) => onVolumeChange(Number(event.target.value))} /></div>
      </section>
      <section className="settings-card"><h2>Library data</h2><p className="muted">Stored in this browser only.</p>
        {resets.map((item) => <div className="settings-row" key={item.label}><span className="settings-label"><span><strong>{item.label}</strong><small>{item.detail}</small></span></span><button className="settings-danger" disabled={item.disabled} onClick={item.onClick}><Trash2 size={15} /> Clear</button></div>)}
      </section>
    </div>
  );
}
