import "./PlayerBar.css";
import { ShuffleButton, RepeatButton } from "./PlaybackModes";
import { Heart, SkipBack, Play, Pause, SkipForward, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";

export default function PlayerBar({ track, audio, liked, onLike, onSkipBack, onSkipForward, shuffle, repeat, onToggleShuffle, onToggleRepeat, volume, muted, onToggleMute, onVolumeChange, expanded, onToggleExpanded }) {
  const { isPlaying, progress, duration, togglePlay, formatTime, seek } = audio;
  const total = formatTime(duration) === "0:00" ? track.duration : formatTime(duration);
  return (
    <footer className="player-bar" aria-label="Player">
      <input className="bar-progress" type="range" min="0" max="100" step="0.1" value={progress} aria-label="Track position" style={{ "--progress": `${progress}%` }} onChange={(event) => seek((Number(event.target.value) / 100) * duration)} />
      <div className="bar-controls">
        <button className="ctrl-btn bar-prev" onClick={onSkipBack} aria-label="Previous track"><SkipBack size={20} fill="currentColor" /></button>
        <button className="play-btn bar-play" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>{isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}</button>
        <button className="ctrl-btn" onClick={onSkipForward} aria-label="Next track"><SkipForward size={20} fill="currentColor" /></button>
        <span className="bar-time">{formatTime((progress / 100) * duration)} / {total}</span>
      </div>
      <div className="bar-center">
        <button className="bar-track" onClick={onToggleExpanded} aria-label={expanded ? "Close player" : `Open player for ${track.title}`}><img src={track.cover} alt="" /><span><strong>{track.title}</strong><small>{track.artist}</small></span></button>
        <button className={`ctrl-btn like ${liked ? "liked" : ""}`} onClick={onLike} aria-label={liked ? "Remove from collection" : "Add to collection"} aria-pressed={liked}><Heart size={19} fill={liked ? "currentColor" : "none"} /></button>
      </div>
      <div className="bar-extras">
        <div className="bar-volume"><button className={`ctrl-btn mute-btn ${muted ? "selected" : ""}`} onClick={onToggleMute} aria-label={volume === 0 ? "Unmute" : "Mute"} aria-pressed={muted} title={`${volume === 0 ? "Unmute" : "Mute"} (M)`}>{volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}</button><input type="range" min="0" max="100" value={volume} aria-label="Volume" onChange={(event) => onVolumeChange(Number(event.target.value))} /></div>
        <ShuffleButton shuffle={shuffle} onToggle={onToggleShuffle} />
        <RepeatButton repeat={repeat} onCycle={onToggleRepeat} />
        <button className="ctrl-btn" onClick={onToggleExpanded} aria-label={expanded ? "Close player" : "Open player and queue"}>{expanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}</button>
      </div>
    </footer>
  );
}
