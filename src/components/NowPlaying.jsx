import "./NowPlaying.css";
import VinylDisc from "./VinylDisc";
import { pop, removeRow } from "../motion";
import useHasChanged from "../hooks/useHasChanged";
import { ShuffleButton, RepeatButton } from "./PlaybackModes";
import { Heart, SkipBack, Play, SkipForward, Pause, ChevronDown, X } from "lucide-react";

export default function NowPlaying({ ref, state, instant, track, audio, liked, onLike, onSkipForward, onSkipBack, onToggleShuffle, onToggleRepeat, shuffle, repeat, queueTracks, comingUp, contextLabel, onPlay, onRemoveFromQueue, onClose }) {
  const { isPlaying, isLoading, progress, duration, togglePlay, formatTime, seek, error } = audio;
  const swapped = useHasChanged(isPlaying);
  const row = (item, action) => <div className="pv-row" key={action ? `queue-${item.id}-${action.occurrence}` : item.id}><button className="pv-row-main" onClick={() => onPlay(item.id)}><img src={item.cover} alt="" /><span><strong>{item.title}</strong><small>{item.artist}</small></span></button><span className="row-duration">{item.duration}</span>{action && <button className="icon-button" aria-label={`Remove ${item.title} from queue`} onClick={(event) => removeRow(event.currentTarget.closest(".pv-row"), () => onRemoveFromQueue(action.index))}><X size={16} /></button>}</div>;
  return (
    <section ref={ref} className="player-view" data-state={state} data-instant={instant || undefined} inert={state === "closed"} aria-label="Now playing">
      <div className="pv-stage">
        <button className="icon-button pv-close" onClick={onClose} aria-label="Close player"><ChevronDown size={22} /></button>
        {/* Keyed by track: a new song swaps the sleeve and slides a fresh record out of it. */}
        <div className="pv-record"><img key={`sleeve-${track.id}`} className="pv-sleeve" src={track.cover} alt={`${track.title} cover`} /><div key={`disc-${track.id}`} className="pv-disc"><VinylDisc track={track} isPlaying={isPlaying} /></div></div>
        <div className="pv-info">
          <div className="pv-title-row"><div key={track.id} className="track-swap"><h2 className="np-title">{track.title}</h2><p className="np-artist">{track.artist}</p></div><span className="rpm-badge">{track.rpm}</span><button className={`ctrl-btn like ${liked ? "liked" : ""}`} onClick={(event) => { if (!liked) pop(event.currentTarget.querySelector("svg")); onLike(); }} aria-label={liked ? "Remove from collection" : "Add to collection"} aria-pressed={liked}><Heart size={20} fill={liked ? "currentColor" : "none"} /></button></div>
          <div className="np-progress"><span>{formatTime((progress / 100) * duration)}</span><input className="progress-range" aria-label="Track position" type="range" min="0" max="100" step="0.1" value={progress} onChange={(event) => seek((Number(event.target.value) / 100) * duration)} /><span>{formatTime(duration) === "0:00" ? track.duration : formatTime(duration)}</span></div>
          <div className="np-controls">
            <ShuffleButton shuffle={shuffle} onToggle={onToggleShuffle} />
            <button className="ctrl-btn" onClick={onSkipBack} aria-label="Previous track"><SkipBack size={22} fill="currentColor" /></button>
            <button className={`play-btn ${swapped ? "swapped" : ""}`} onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>{isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}</button>
            <button className="ctrl-btn" onClick={onSkipForward} aria-label="Next track"><SkipForward size={22} fill="currentColor" /></button>
            <RepeatButton repeat={repeat} onCycle={onToggleRepeat} />
          </div>
          {error && <p className="playback-error" role="status">{error}</p>}
          {!error && isLoading && <p className="playback-status" role="status">Loading audio…</p>}
        </div>
      </div>
      <aside className="pv-upnext" aria-label="Up next">
        <h3 className="pv-tab">Up next</h3>
        {queueTracks.length > 0 && <><p className="pv-group">Queue · {queueTracks.length}</p>{queueTracks.map(({ item, index }, at) => row(item, { index, occurrence: queueTracks.slice(0, at).filter((entry) => entry.item.id === item.id).length }))}</>}
        <p className="pv-group">Playing from {contextLabel}{shuffle ? " · shuffled" : ""}{repeat === "one" ? " · repeating this song" : ""}</p>
        {comingUp.map((item) => row(item))}
        {repeat === "off" && <p className="pv-end">{comingUp.length ? "Playback stops after the last song. Turn on repeat to keep going." : "This is the last song. Turn on repeat to keep going."}</p>}
      </aside>
    </section>
  );
}
