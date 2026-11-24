import { useEffect, useRef, useState } from "react";
import "./SortMenu.css";
import { ArrowUpDown, Check } from "lucide-react";
import { SORT_OPTIONS } from "../sorting";
import usePresence from "../hooks/usePresence";

// A "Sort: …" chip that opens a small menu of sort orders.
// `defaultLabel` names the list's own order, e.g. "Playlist order".
export default function SortMenu({ value, onChange, defaultLabel }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const { present, state } = usePresence(open, listRef);
  const options = SORT_OPTIONS.map((option) => ({ ...option, label: option.label ?? defaultLabel }));
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    // Focus the chosen option so arrow keys start from it.
    wrapRef.current?.querySelector('[aria-checked="true"]')?.focus();
    const onPointer = (event) => { if (!wrapRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const choose = (next) => { onChange(next); setOpen(false); buttonRef.current?.focus(); };
  const onMenuKey = (event) => {
    const items = [...wrapRef.current.querySelectorAll('[role="menuitemradio"]')];
    const at = items.indexOf(document.activeElement);
    if (event.key === "Escape") { event.stopPropagation(); setOpen(false); buttonRef.current?.focus(); }
    else if (event.key === "ArrowDown") { event.preventDefault(); items[(at + 1) % items.length].focus(); }
    else if (event.key === "ArrowUp") { event.preventDefault(); items[(at - 1 + items.length) % items.length].focus(); }
    else if (event.key === "Tab") setOpen(false);
  };

  return (
    <div className="sort-menu" ref={wrapRef}>
      <button ref={buttonRef} className={`sort-trigger ${value !== "default" ? "active" : ""}`} onClick={() => setOpen((state) => !state)} aria-haspopup="menu" aria-expanded={open}><ArrowUpDown size={15} /><span>Sort: {current.label}</span></button>
      {present && <div ref={listRef} className="sort-list" role="menu" aria-label="Sort by" data-state={state} inert={!open} onKeyDown={onMenuKey}>
        {options.map((option) => <button key={option.value} role="menuitemradio" aria-checked={option.value === current.value} onClick={() => choose(option.value)}>{option.label}{option.value === current.value && <Check size={15} />}</button>)}
      </div>}
    </div>
  );
}
