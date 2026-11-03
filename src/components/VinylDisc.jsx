import "./VinylDisc.css";
import { Volume2, VolumeX } from "lucide-react";

export default function VinylDisc({ track, audio, volume, onVolumeChange }) {
  const { isPlaying, progress, duration, formatTime } = audio;
  const changeVolume = (event) => onVolumeChange(Number(event.target.value));
  return <div className="vinyl-panel"><div className={`vinyl ${isPlaying ? "spinning" : ""}`} aria-label={`Vinyl record for ${track.title}`}><div className="vinyl-label"><div className="waveform" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} style={{ height: `${18 + ((index * 7) % 5) * 12}px` }} />)}</div></div></div><div className="vinyl-time">{formatTime((progress / 100) * duration)} / {formatTime(duration) === "0:00" ? track.duration : formatTime(duration)}</div><label className="volume-control" aria-label="Volume"><span>{volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}</span><input type="range" min="0" max="100" value={volume} aria-label="Volume" onChange={changeVolume} /></label></div>;
}
