import "./NowPlaying.css";
import VinylDisc from "./VinylDisc";
import { Heart, SkipBack, Play, SkipForward, Pause, Shuffle, Repeat, ChevronDown, X } from "lucide-react";

export default function NowPlaying({ track, audio, liked, onLike, onSkipForward, onSkipBack, onToggleShuffle, onToggleRepeat, shuffle, repeat, queueTracks, comingUp, onPlay, onRemoveFromQueue, onClose }) {
  const { isPlaying, isLoading, progress, duration, togglePlay, formatTime, seek, error } = audio;
  const row = (item, action) => <div className="pv-row" key={action ? `queue-${action.index}` : item.id}><button className="pv-row-main" onClick={() => onPlay(item.id)}><img src={item.cover} alt="" /><span><strong>{item.title}</strong><small>{item.artist}</small></span></button><span className="row-duration">{item.duration}</span>{action && <button className="icon-button" aria-label={`Remove ${item.title} from queue`} onClick={() => onRemoveFromQueue(action.index)}><X size={16} /></button>}</div>;
  return (
    <section className="player-view" aria-label="Now playing">
      <div className="pv-stage">
        <button className="icon-button pv-close" onClick={onClose} aria-label="Close player"><ChevronDown size={22} /></button>
        <div className="pv-record"><img className="pv-sleeve" src={track.cover} alt={`${track.title} cover`} /><div className="pv-disc"><VinylDisc track={track} isPlaying={isPlaying} /></div></div>
        <div className="pv-info">
          <div className="pv-title-row"><div><h2 className="np-title">{track.title}</h2><p className="np-artist">{track.artist}</p></div><span className="rpm-badge">{track.rpm}</span><button className={`ctrl-btn like ${liked ? "liked" : ""}`} onClick={onLike} aria-label={liked ? "Remove from collection" : "Add to collection"} aria-pressed={liked}><Heart size={20} fill={liked ? "currentColor" : "none"} /></button></div>
          <div className="np-progress"><span>{formatTime((progress / 100) * duration)}</span><input className="progress-range" aria-label="Track position" type="range" min="0" max="100" step="0.1" value={progress} onChange={(event) => seek((Number(event.target.value) / 100) * duration)} /><span>{formatTime(duration) === "0:00" ? track.duration : formatTime(duration)}</span></div>
          <div className="np-controls">
            <button className={`ctrl-btn toggle-control ${shuffle ? "selected" : ""}`} onClick={onToggleShuffle} aria-label="Toggle shuffle" aria-pressed={shuffle}><Shuffle size={18} /></button>
            <button className="ctrl-btn" onClick={onSkipBack} aria-label="Previous track"><SkipBack size={22} fill="currentColor" /></button>
            <button className="play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>{isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}</button>
            <button className="ctrl-btn" onClick={onSkipForward} aria-label="Next track"><SkipForward size={22} fill="currentColor" /></button>
            <button className={`ctrl-btn toggle-control ${repeat ? "selected" : ""}`} onClick={onToggleRepeat} aria-label="Toggle repeat" aria-pressed={repeat}><Repeat size={18} /></button>
          </div>
          {error && <p className="playback-error" role="status">{error}</p>}
          {!error && isLoading && <p className="playback-status" role="status">Loading audio…</p>}
        </div>
      </div>
      <aside className="pv-upnext" aria-label="Up next">
        <h3 className="pv-tab">Up next</h3>
        {queueTracks.length > 0 && <><p className="pv-group">Queue · {queueTracks.length}</p>{queueTracks.map(({ item, index }) => row(item, { index }))}</>}
        <p className="pv-group">Coming up</p>
        {comingUp.map((item) => row(item))}
      </aside>
    </section>
  );
}
