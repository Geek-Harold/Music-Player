import "./NowPlaying.css";
import { playlist } from "../data/tracks";
import { Heart, SkipBack, Play, SkipForward, Pause, Shuffle, Repeat, ListPlus } from "lucide-react";

export default function NowPlaying({ track, upcoming, audio, liked, onLike, onSkipForward, onSkipBack, onToggleShuffle, onToggleRepeat, shuffle, repeat, onAddToQueue }) {
  const { isPlaying, isLoading, progress, duration, togglePlay, formatTime, seek, error } = audio;
  const index = playlist.findIndex((item) => item.id === track.id);
  const nextTrack = upcoming ?? playlist[(index + 1) % playlist.length];
  return (
    <section className="now-playing" aria-label="Now playing">
      <div className="np-main">
        <div className="album-art"><span className="art-spine">{track.artist.toUpperCase()}</span><img className="art-image" src={track.cover} alt={`${track.title} cover`} /></div>
        <div className="np-info">
          <p className="eyebrow">NOW PLAYING</p><h2 className="np-title">{track.title}</h2><p className="np-artist">{track.artist}</p>
          <div className="np-progress"><span>{formatTime((progress / 100) * duration)}</span><input className="progress-range" aria-label="Track position" type="range" min="0" max="100" step="0.1" value={progress} onChange={(event) => seek((Number(event.target.value) / 100) * duration)} /><span>{formatTime(duration) === "0:00" ? track.duration : formatTime(duration)}</span></div>
          <div className="np-controls">
            <button className={`ctrl-btn like ${liked ? "liked" : ""}`} onClick={onLike} aria-label={liked ? "Remove from collection" : "Add to collection"} aria-pressed={liked}><Heart size={20} fill={liked ? "currentColor" : "none"} /></button>
            <button className={`ctrl-btn toggle-control ${shuffle ? "selected" : ""}`} onClick={onToggleShuffle} aria-label="Toggle shuffle" aria-pressed={shuffle}><Shuffle size={17} /></button>
            <button className="ctrl-btn" onClick={onSkipBack} aria-label="Previous track"><SkipBack size={20} /></button>
            <button className="play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>{isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}</button>
            <button className="ctrl-btn" onClick={onSkipForward} aria-label="Next track"><SkipForward size={20} /></button>
            <button className={`ctrl-btn toggle-control ${repeat ? "selected" : ""}`} onClick={onToggleRepeat} aria-label="Toggle repeat" aria-pressed={repeat}><Repeat size={17} /></button>
            <button className="ctrl-btn" onClick={onAddToQueue} aria-label="Add current track to queue"><ListPlus size={19} /></button>
          </div>
          {error && <p className="playback-error" role="status">{error}</p>}
          {!error && isLoading && <p className="playback-status" role="status">Loading audio…</p>}
          <span className="rpm-badge">{track.rpm}</span>
        </div>
      </div>
      <button className="up-next" onClick={onSkipForward} aria-label={`Play next: ${nextTrack.title}`}><span className="up-next-label">UP NEXT · PLAY NOW</span><span className="up-next-row"><img className="up-next-thumb" src={nextTrack.cover} alt="" /><span className="up-next-title">{nextTrack.title} - {nextTrack.artist}</span><span className="up-next-duration">{nextTrack.duration}</span></span></button>
    </section>
  );
}
