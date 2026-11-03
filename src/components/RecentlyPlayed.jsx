import "./RecentlyPlayed.css";

export default function RecentlyPlayed({ title = "Recently Played", tracks, onPlay }) {
  return <section className="shelf"><h3 className="section-heading">{title}</h3>{tracks.length ? <div className="recent-grid">{tracks.map((track) => <button key={track.id} className="recent-card" onClick={() => onPlay(track.id)}><img className="recent-art" src={track.cover} alt={`${track.title} cover`} /><span className="recent-title">{track.title}</span><span className="recent-artist">{track.artist}</span></button>)}</div> : <p className="muted">Your listening history will appear here.</p>}</section>;
}
