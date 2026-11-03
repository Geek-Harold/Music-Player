import { useEffect, useRef, useState } from "react";
import "./ProfileCard.css";
import { Heart, Clock3, Settings, RefreshCw, Pencil, Check, X, Camera, Trash2 } from "lucide-react";

const PROFILE_COLORS = ["#b98a99", "#8a5a6e", "#6d4458", "#d69e36", "#5f7a6e", "#5a6f8a"];
const initialOf = (name) => (name.trim()[0] ?? "S").toUpperCase();
const avatarContent = (person) => person.photo ? <img src={person.photo} alt="" /> : initialOf(person.name);
const PHOTO_SIZE = 256;

// Centre-crops the picture to a square and shrinks it to 256px, so it fits
// comfortably in browser storage (roughly 15–30 KB) and stays sharp at 2× size.
async function squarePhoto(file) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  canvas.getContext("2d").drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.88);
}

export default function ProfileCard({ profile, onSave, stats, onNavigate, onSync, syncing }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const wrapRef = useRef(null);
  const fileRef = useRef(null);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onPointer = (event) => { if (!wrapRef.current?.contains(event.target)) setOpen(false); };
    const onKey = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const toggle = () => { setOpen((value) => !value); setEditing(false); };
  const startEdit = () => { setDraft(profile); setPhotoError(""); setEditing(true); };
  const choosePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoError("Choose an image file (JPG, PNG, WebP or GIF).");
    if (file.size > 15 * 1024 * 1024) return setPhotoError("That image is over 15 MB. Pick a smaller one.");
    try {
      const photo = await squarePhoto(file);
      setDraft((current) => ({ ...current, photo }));
      setPhotoError("");
    } catch {
      setPhotoError("Couldn't read that image. Try a JPG or PNG.");
    }
  };
  const save = (event) => {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) return;
    onSave({ ...profile, name, color: draft.color, photo: draft.photo ?? null });
    setEditing(false);
  };
  const go = (view) => { setOpen(false); onNavigate(view); };
  const since = new Date(profile.createdAt).toLocaleDateString([], { month: "long", year: "numeric" });
  const shown = editing ? draft : profile;

  return (
    <div className="profile" ref={wrapRef}>
      <button className="avatar" style={{ background: profile.color }} onClick={toggle} aria-label={`Profile: ${profile.name}`} aria-expanded={open} aria-haspopup="dialog">{avatarContent(profile)}</button>
      {open && <section className="profile-card" role="dialog" aria-label="Your profile">
        <div className="profile-banner" style={{ "--tone": shown.color }} />
        <div className="profile-head">
          {editing ? <button type="button" className="avatar avatar-lg avatar-edit" style={{ background: shown.color }} onClick={() => fileRef.current?.click()} aria-label={draft.photo ? "Change profile picture" : "Upload profile picture"}>{avatarContent(shown)}<span className="avatar-camera" aria-hidden="true"><Camera size={18} /></span></button> : <span className="avatar avatar-lg" style={{ background: shown.color }}>{avatarContent(shown)}</span>}
          {editing ? <form className="profile-form" onSubmit={save}>
            <div className="profile-label">Picture<div className="profile-photo-row"><button type="button" className="profile-ghost" onClick={() => fileRef.current?.click()}><Camera size={14} /> {draft.photo ? "Change photo" : "Upload photo"}</button>{draft.photo && <button type="button" className="profile-ghost" onClick={() => setDraft({ ...draft, photo: null })}><Trash2 size={14} /> Remove</button>}</div><input ref={fileRef} type="file" accept="image/*" hidden onChange={choosePhoto} />{photoError && <p className="profile-error" role="alert">{photoError}</p>}</div>
            <label className="profile-label">Display name<input autoFocus maxLength={40} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <div className="profile-label" role="radiogroup" aria-label="Avatar colour">{draft.photo ? "Banner colour" : "Colour"}<div className="swatches">{PROFILE_COLORS.map((color) => <button type="button" key={color} className={`swatch ${draft.color === color ? "selected" : ""}`} style={{ background: color }} role="radio" aria-checked={draft.color === color} aria-label={`Colour ${color}`} onClick={() => setDraft({ ...draft, color })} />)}</div></div>
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
