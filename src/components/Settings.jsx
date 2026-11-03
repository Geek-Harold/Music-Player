import "./Settings.css";
import { Shuffle, Repeat, Volume2, VolumeX, Trash2 } from "lucide-react";

export default function Settings({ shuffle, repeat, onToggleShuffle, onToggleRepeat, volume, onVolumeChange, counts, onClearHistory, onClearLikes, onClearPlaylists }) {
  const confirmThen = (message, action) => () => { if (window.confirm(message)) action(); };
  const resets = [
    { label: "Listening history", detail: `${counts.recent} recent ${counts.recent === 1 ? "track" : "tracks"}`, disabled: !counts.recent, onClick: confirmThen("Clear your listening history?", onClearHistory) },
    { label: "Liked tracks", detail: `${counts.likes} in your collection`, disabled: !counts.likes, onClick: confirmThen("Remove every track from your collection?", onClearLikes) },
    { label: "Playlists", detail: `${counts.playlists} ${counts.playlists === 1 ? "playlist" : "playlists"}`, disabled: !counts.playlists, onClick: confirmThen("Delete all of your playlists?", onClearPlaylists) },
  ];
  return (
    <div className="settings">
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
