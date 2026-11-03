import { useEffect, useRef, useState } from "react";
import "./ProfileCard.css";
import { Heart, Clock3, Settings, RefreshCw, Pencil, Check, X } from "lucide-react";

const PROFILE_COLORS = ["#b98a99", "#8a5a6e", "#6d4458", "#d69e36", "#5f7a6e", "#5a6f8a"];
const initialOf = (name) => (name.trim()[0] ?? "S").toUpperCase();

export default function ProfileCard({ profile, onSave, stats, onNavigate, onSync, syncing }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event) => { if (!wrapRef.current?.contains(event.target)) setOpen(false); };
    const onKey = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const toggle = () => { setOpen((value) => !value); setEditing(false); };
  const startEdit = () => { setDraft(profile); setEditing(true); };
  const save = (event) => {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) return;
    onSave({ ...profile, name, color: draft.color });
    setEditing(false);
  };
  const go = (view) => { setOpen(false); onNavigate(view); };
  const since = new Date(profile.createdAt).toLocaleDateString([], { month: "long", year: "numeric" });
  const shown = editing ? draft : profile;

  return (
    <div className="profile" ref={wrapRef}>
      <button className="avatar" style={{ background: profile.color }} onClick={toggle} aria-label={`Profile: ${profile.name}`} aria-expanded={open} aria-haspopup="dialog">{initialOf(profile.name)}</button>
      {open && <section className="profile-card" role="dialog" aria-label="Your profile">
        <div className="profile-banner" style={{ "--tone": shown.color }} />
        <div className="profile-head">
          <span className="avatar avatar-lg" style={{ background: shown.color }}>{initialOf(shown.name)}</span>
          {editing ? <form className="profile-form" onSubmit={save}>
            <label className="profile-label">Display name<input autoFocus maxLength={40} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <div className="profile-label" role="radiogroup" aria-label="Avatar colour">Colour<div className="swatches">{PROFILE_COLORS.map((color) => <button type="button" key={color} className={`swatch ${draft.color === color ? "selected" : ""}`} style={{ background: color }} role="radio" aria-checked={draft.color === color} aria-label={`Colour ${color}`} onClick={() => setDraft({ ...draft, color })} />)}</div></div>
            <div className="profile-form-actions"><button type="button" className="profile-ghost" onClick={() => setEditing(false)}><X size={15} /> Cancel</button><button className="profile-primary" disabled={!draft.name.trim()}><Check size={15} /> Save</button></div>
          </form> : <>
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-sub">Local library · listening since {since}</p>
            <button className="profile-ghost" onClick={startEdit}><Pencil size={14} /> Edit profile</button>
          </>}
        </div>
        {!editing && <>
          <dl className="profile-stats">
            <div><dt>Tracks</dt><dd>{stats.tracks}</dd></div>
            <div><dt>Liked</dt><dd>{stats.likes}</dd></div>
            <div><dt>Playlists</dt><dd>{stats.playlists}</dd></div>
          </dl>
          <nav className="profile-menu" aria-label="Profile">
            <button onClick={() => go("Collection")}><Heart size={17} /> Your collection</button>
            <button onClick={() => go("Recently Played")}><Clock3 size={17} /> Listening history</button>
            <button onClick={() => go("Settings")}><Settings size={17} /> Settings</button>
            {onSync && <button onClick={onSync} disabled={syncing}><RefreshCw size={17} className={syncing ? "spin" : ""} /> {syncing ? "Syncing library…" : "Sync library"}</button>}
          </nav>
        </>}
      </section>}
    </div>
  );
}
