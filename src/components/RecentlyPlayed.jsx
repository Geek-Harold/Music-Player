import "./RecentlyPlayed.css";
import { recentlyPlayed } from "../data/tracks";

export default function RecentlyPlayed() {
  return (
    <section className="recent">
      <h3 className="section-heading">Recently Played</h3>
      <div className="recent-grid">
        {recentlyPlayed.map((album) => (
          <div key={album.id} className="recent-card">
            <div className="recent-art">{album.title[0]}</div>
            <p className="recent-title">{album.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
