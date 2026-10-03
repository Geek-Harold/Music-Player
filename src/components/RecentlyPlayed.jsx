import "./RecentlyPlayed.css";

export default function RecentlyPlayed({ tracks, onPlay }) {
  return (
    <section className="recent">
      <h3 className="section-heading">Recently Played</h3>
      <div className="recent-grid">
        {tracks.map((album) => (
          <div key={album.id} className="recent-card" onClick={() => onPlay(album.id)}>
            <div className="recent-art">{album.title[0]}</div>
            <p className="recent-title">{album.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
