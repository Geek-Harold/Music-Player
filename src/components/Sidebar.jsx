import "./Sidebar.css";
import { Home, Compass, Heart, Sparkles, Settings, Clock3, Plus, ListMusic } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Compass, label: "Browse" },
  { icon: Heart, label: "Collection" },
  { icon: Clock3, label: "Recently Played", short: "Recent" },
  { icon: Sparkles, label: "Charts" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar({ activeView, activePlaylist, playlists, onNavigate, onOpenPlaylist, onNewPlaylist }) {
  return (
    <aside className="sidebar">
      <button className="logo" onClick={() => onNavigate("Home")} aria-label="SONA home">SONA<span>VINYL PLAYER</span></button>
      <nav aria-label="Main navigation">{navItems.map(({ icon: Icon, label, short }) => <button key={label} className={`nav-item ${activeView === label ? "active" : ""}`} onClick={() => onNavigate(label)} aria-current={activeView === label ? "page" : undefined}><Icon size={20} /><span className="nav-label" data-short={short ?? label}>{label}</span></button>)}</nav>
      <div className="sidebar-library">
        <h2 className="section-title">Playlists</h2>
        <button className="new-playlist" onClick={onNewPlaylist}><Plus size={15} /> New playlist</button>
        <ul className="playlist-links">{playlists.map((item) => <li key={item.id}><button className={`playlist-link ${activeView === "Playlist" && activePlaylist === item.id ? "active" : ""}`} onClick={() => onOpenPlaylist(item.id)}><ListMusic size={15} /><span>{item.name}</span></button></li>)}</ul>
      </div>
    </aside>
  );
}
