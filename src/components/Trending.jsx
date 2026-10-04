import "./Trending.css";

export default function Trending({ tracks, onPlay }) {
  return (
    <section className="trending">
      <h3 className="section-heading">Trending</h3>
      <ul className="trending-list">
        {tracks.map((track, i) => (
          <li key={track.id} className="trending-row" onClick={() => onPlay(track.id)}>
            <img className="trending-thumb" src={track.cover} alt="" />
            <span className="trending-title">
              {track.title} - {track.artist}
            </span>
            <span className="trending-rank">#{i + 1}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

