import { useState } from "react";
import "./Sidebar.css";
import { Play, Compass, Heart, Sparkles, Settings, Search, Clock3, Plus, X } from "lucide-react";

const navItems = [
  { icon: Play, label: "Now playing" },
  { icon: Compass, label: "Browse" },
  { icon: Heart, label: "Collection" },
  { icon: Clock3, label: "Recently Played" },
  { icon: Sparkles, label: "Charts" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar({ activeView, playlists, onNavigate, onSearch, onOpenPlaylist, onCreatePlaylist }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const submit = (event) => {
    event.preventDefault();
    onCreatePlaylist(name);
    setName("");
    setCreating(false);
  };
  return (
    <aside className="sidebar">
      <button className="logo" onClick={() => onNavigate("Now playing")} aria-label="SONA home">SONA<span>VINYL PLAYER</span></button>
      <nav aria-label="Main navigation">{navItems.map(({ icon: Icon, label }) => <button key={label} className={`nav-item ${activeView === label ? "active" : ""}`} onClick={() => onNavigate(label)}><Icon size={18} />{label}</button>)}</nav>
      <div className="sidebar-section-head"><h2 className="section-title">Playlists</h2><button className="sidebar-add" aria-label="Create playlist" onClick={() => setCreating(true)}><Plus size={17} /></button></div>
      <ul className="playlist-links">{playlists.map((item) => <li key={item.id}><button className="playlist-link" onClick={() => onOpenPlaylist(item.id)}>{item.name}</button></li>)}</ul>
      {creating && <form className="playlist-form" onSubmit={submit}><input autoFocus aria-label="Playlist name" placeholder="Playlist name" value={name} onChange={(event) => setName(event.target.value)} /><button aria-label="Save playlist"><Plus size={16} /></button><button type="button" aria-label="Cancel" onClick={() => { setCreating(false); setName(""); }}><X size={16} /></button></form>}
      {!creating && <button className="new-playlist" onClick={() => setCreating(true)}><Plus size={15} /> New playlist</button>}
      <label className="search-wrap"><Search size={16} /><input className="search" placeholder="Search tracks..." onChange={(event) => onSearch(event.target.value)} /></label>
      <div className="user"><span className="avatar">S</span><span>Local library</span></div>
    </aside>
  );
}
