import { useEffect, useRef } from "react";
import "./Sidebar.css";
import { Home, Compass, Heart, Sparkles, Settings, Clock3, Plus, ListMusic, Menu, X } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Compass, label: "Browse" },
  { icon: Heart, label: "Collection" },
  { icon: Clock3, label: "Recently Played", short: "Recent" },
  { icon: Sparkles, label: "Charts" },
  { icon: Settings, label: "Settings" },
];
const MENU_LABELS = { full: "Collapse menu", rail: "Expand menu", drawer: "Close menu" };

// variant: "full" (desktop), "rail" (icons only), "tabs" (phone bottom bar), "drawer" (slide-over menu).
export default function Sidebar({ variant = "full", activeView, activePlaylist, playlists, onNavigate, onOpenPlaylist, onNewPlaylist, onToggleMenu }) {
  const compact = variant === "rail" || variant === "tabs";
  const menuRef = useRef(null);
  // When the drawer opens, put keyboard focus inside it.
  useEffect(() => { if (variant === "drawer") menuRef.current?.focus(); }, [variant]);
  return (
    <aside className={`sidebar sidebar-${variant}`} aria-label={variant === "drawer" ? "Menu" : "Sidebar"}>
      {variant !== "tabs" && <div className="sidebar-head">
        <button ref={menuRef} className="menu-button" onClick={onToggleMenu} aria-label={MENU_LABELS[variant]} aria-expanded={variant !== "rail"} title={MENU_LABELS[variant]}>{variant === "drawer" ? <X size={22} /> : <Menu size={22} />}</button>
        {variant !== "rail" && <button className="logo" onClick={() => onNavigate("Home")} aria-label="SONA home">SONA<span>VINYL PLAYER</span></button>}
      </div>}
      <nav aria-label="Main navigation">{navItems.map(({ icon: Icon, label, short }) => <button key={label} className={`nav-item ${activeView === label ? "active" : ""}`} onClick={() => onNavigate(label)} aria-current={activeView === label ? "page" : undefined} aria-label={compact ? label : undefined} title={variant === "rail" ? label : undefined}><Icon size={20} /><span className="nav-label">{compact ? short ?? label : label}</span></button>)}</nav>
      {!compact && <div className="sidebar-library">
        <h2 className="section-title">Playlists</h2>
        <button className="new-playlist" onClick={onNewPlaylist}><Plus size={15} /> New playlist</button>
        <ul className="playlist-links">{playlists.map((item) => <li key={item.id}><button className={`playlist-link ${activeView === "Playlist" && activePlaylist === item.id ? "active" : ""}`} onClick={() => onOpenPlaylist(item.id)}><ListMusic size={15} /><span>{item.name}</span></button></li>)}</ul>
      </div>}
    </aside>
  );
}
