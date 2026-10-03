import "./Sidebar.css";

const playlists = [
  "Alternative Rock",
  "90s Classics",
  "Industrial Metal",
  "Lithuanian Indie",
  "Sunday Morning",
  "Daily Mix",
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h1 className="logo">
        SONA<span>Vinyl Streaming</span>
      </h1>

      <nav>
        <a className="nav-item active">? Now playing</a>
        <a className="nav-item">? Browse</a>
        <a className="nav-item">? Collection</a>
        <a className="nav-item">? Charts</a>
        <a className="nav-item">? Settings</a>
      </nav>

      <h2 className="section-title">Playlists</h2>
      <ul>
        {playlists.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <a className="new-playlist">+ New playlist</a>

      <input className="search" placeholder="Search..." />

      <div className="user">
        <span className="avatar">U</span> Username
      </div>
    </aside>
  );
}
