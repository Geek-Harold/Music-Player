import "./Sidebar.css";
import { Play, Compass, Heart, Sparkles, Settings } from "lucide-react";

const playlists = [
  "Alternative Rock",
  "90s Classics",
  "Industrial Metal",
  "Lithuanian Indie",
  "Sunday Morning",
  "Daily Mix",
];

const navItems = [
  { icon: Play, label: "Now playing", active: true },
  { icon: Compass, label: "Browse" },
  { icon: Heart, label: "Collection" },
  { icon: Sparkles, label: "Charts" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h1 className="logo">
        SONA<span>Vinyl Streaming</span>
      </h1>

      <nav>
        {navItems.map(({ icon: Icon, label, active }) => (
          <a key={label} className={`nav-item ${active ? "active" : ""}`}>
            <Icon size={18} />
            {label}
          </a>
        ))}
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
