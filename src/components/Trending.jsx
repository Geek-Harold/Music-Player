import "./Trending.css";
import { trending } from "../data/tracks";

export default function Trending() {
  return (
    <section className="trending">
      <h3 className="section-heading">Trending</h3>
      <ul className="trending-list">
        {trending.map((track) => (
          <li key={track.rank} className="trending-row">
            <div className="trending-thumb">{track.artist[0]}</div>
            <span className="trending-title">
              {track.title} - {track.artist}
            </span>
            <span className="trending-rank">#{track.rank}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
