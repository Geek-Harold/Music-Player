import { useEffect, useRef, useState } from "react";
import "./PlaylistDialog.css";
import PlaylistCover from "./PlaylistCover";
import { Search, X, Check } from "lucide-react";

export default function PlaylistDialog({ tracks, existingNames, onCreate, onClose }) {
  const dialogRef = useRef(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  const nameRef = useRef(null);
  // showModal gives us the backdrop, focus trapping and Esc-to-close for free.
  // It focuses the first button (Close), so move focus to the title field after.
  useEffect(() => { dialogRef.current?.showModal(); nameRef.current?.focus(); }, []);

  const close = () => dialogRef.current?.close();
  const toggle = (id) => setSelected((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const term = filter.trim().toLowerCase();
  const visible = term ? tracks.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(term)) : tracks;
  const selectedTracks = selected.map((id) => tracks.find((track) => track.id === id)).filter(Boolean);
  const submit = (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    const problem = !cleanName ? "Give your playlist a name." : existingNames.some((item) => item.toLowerCase() === cleanName.toLowerCase()) ? "You already have a playlist with that name." : "";
    if (problem) { setError(problem); nameRef.current?.focus(); return; }
    onCreate({ name: cleanName, description: description.trim(), trackIds: selected });
  };

  return (
    <dialog ref={dialogRef} className="playlist-dialog" aria-labelledby="playlist-dialog-title" onClose={onClose} onClick={(event) => { if (event.target === dialogRef.current) close(); }}>
      <form className="pd-form" onSubmit={submit} noValidate>
        <header className="pd-header"><div><p className="eyebrow">NEW PLAYLIST</p><h2 id="playlist-dialog-title">{name.trim() || "Untitled playlist"}</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={close}><X size={20} /></button></header>
        <div className="pd-details">
          <PlaylistCover tracks={selectedTracks} className="pd-cover" />
          <div className="pd-fields">
            <label className="pd-label">Title<input ref={nameRef} maxLength={60} placeholder="Late night records" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} aria-invalid={Boolean(error)} /></label>
            <label className="pd-label">Description<textarea rows={2} maxLength={200} placeholder="Optional" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
            {error && <p className="pd-error" role="alert">{error}</p>}
          </div>
        </div>
        <section className="pd-picker" aria-label="Add songs">
          <div className="pd-picker-head"><h3>Add songs</h3><span>{selected.length ? `${selected.length} selected` : "Optional"}</span>{selected.length > 0 && <button type="button" className="pd-link" onClick={() => setSelected([])}>Clear</button>}</div>
          <label className="pd-search"><Search size={16} /><input type="search" placeholder="Filter songs or artists" aria-label="Filter songs" value={filter} onChange={(event) => setFilter(event.target.value)} /></label>
          <ul className="pd-list">
            {visible.map((track) => { const checked = selected.includes(track.id); return <li key={track.id}><label className={`pd-option ${checked ? "checked" : ""}`}><input type="checkbox" checked={checked} onChange={() => toggle(track.id)} /><span className="pd-check" aria-hidden="true">{checked && <Check size={14} strokeWidth={3} />}</span><img src={track.cover} alt="" /><span className="pd-text"><strong>{track.title}</strong><small>{track.artist}</small></span><span className="row-duration">{track.duration}</span></label></li>; })}
            {!visible.length && <li className="pd-empty">No songs match “{filter.trim()}”.</li>}
          </ul>
        </section>
        <footer className="pd-footer"><button type="button" className="pd-cancel" onClick={close}>Cancel</button><button className="pd-create">Create playlist</button></footer>
      </form>
    </dialog>
  );
}
