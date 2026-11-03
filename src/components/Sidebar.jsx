import { useState } from "react";
import "./Sidebar.css";
import { Home, Compass, Heart, Sparkles, Settings, Clock3, Plus, X, ListMusic } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Compass, label: "Browse" },
  { icon: Heart, label: "Collection" },
  { icon: Clock3, label: "Recently Played", short: "Recent" },
  { icon: Sparkles, label: "Charts" },
  { icon: Settings, label: "Settings" },
];

export function NewPlaylist({ onCreate, className = "" }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const submit = (event) => {
    event.preventDefault();
    onCreate(name);
    setName("");
    setCreating(false);
  };
  return creating ? <form className={`playlist-form ${className}`} onSubmit={submit}><input autoFocus aria-label="Playlist name" placeholder="Playlist name" value={name} onChange={(event) => setName(event.target.value)} /><button aria-label="Save playlist"><Plus size={16} /></button><button type="button" aria-label="Cancel" onClick={() => { setCreating(false); setName(""); }}><X size={16} /></button></form> : <button className={`new-playlist ${className}`} onClick={() => setCreating(true)}><Plus size={15} /> New playlist</button>;
}

export default function Sidebar({ activeView, activePlaylist, playlists, onNavigate, onOpenPlaylist, onCreatePlaylist }) {
  return (
    <aside className="sidebar">
      <button className="logo" onClick={() => onNavigate("Home")} aria-label="SONA home">SONA<span>VINYL PLAYER</span></button>
      <nav aria-label="Main navigation">{navItems.map(({ icon: Icon, label, short }) => <button key={label} className={`nav-item ${activeView === label ? "active" : ""}`} onClick={() => onNavigate(label)} aria-current={activeView === label ? "page" : undefined}><Icon size={20} /><span className="nav-label" data-short={short ?? label}>{label}</span></button>)}</nav>
      <div className="sidebar-library">
        <h2 className="section-title">Playlists</h2>
        <NewPlaylist onCreate={onCreatePlaylist} />
        <ul className="playlist-links">{playlists.map((item) => <li key={item.id}><button className={`playlist-link ${activeView === "Playlist" && activePlaylist === item.id ? "active" : ""}`} onClick={() => onOpenPlaylist(item.id)}><ListMusic size={15} /><span>{item.name}</span></button></li>)}</ul>
      </div>
    </aside>
  );
}
