import "./VinylDisc.css";

export default function VinylDisc({ track, isPlaying }) {
  return <div className={`vinyl ${isPlaying ? "spinning" : ""}`} aria-label={`Vinyl record for ${track.title}`}><div className="vinyl-label"><div className="waveform" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} style={{ height: `${18 + ((index * 7) % 5) * 12}%` }} />)}</div></div></div>;
}
