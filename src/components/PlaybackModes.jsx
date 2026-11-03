import { Shuffle, Repeat, Repeat1 } from "lucide-react";

const REPEAT_LABELS = { off: "Repeat off", all: "Repeat all", one: "Repeat one" };
const NEXT_REPEAT = { off: "all", all: "one", one: "off" };

export function ShuffleButton({ shuffle, onToggle, size = 18 }) {
  const label = shuffle ? "Shuffle on" : "Shuffle off";
  return <button className={`ctrl-btn toggle-control ${shuffle ? "selected" : ""}`} onClick={onToggle} aria-label={label} aria-pressed={shuffle} title={label}><Shuffle size={size} /></button>;
}

// Cycles off → all → one, like most streaming apps.
export function RepeatButton({ repeat, onCycle, size = 18 }) {
  const label = `${REPEAT_LABELS[repeat]} (click for ${REPEAT_LABELS[NEXT_REPEAT[repeat]].toLowerCase()})`;
  return <button className={`ctrl-btn toggle-control ${repeat !== "off" ? "selected" : ""}`} onClick={onCycle} aria-label={label} title={REPEAT_LABELS[repeat]}>{repeat === "one" ? <Repeat1 size={size} /> : <Repeat size={size} />}</button>;
}
