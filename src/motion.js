import { flushSync } from "react-dom";

// Small one-shot animations run straight on an element (WAAPI, transform only).
export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE_OUT = "cubic-bezier(.23,1,.32,1)";

// A quick swell, e.g. the heart when you like a track. Only on the user's own action, never on mount.
export function pop(element) {
  if (!element || reducedMotion()) return;
  element.animate([{ transform: "scale(1)" }, { transform: "scale(1.3)", offset: 0.35 }, { transform: "scale(1)" }], { duration: 360, easing: EASE_OUT });
}

// Takes a row out of a list without the rest jumping: the row fades and slides away,
// then `commit` removes it from state and the rows below glide up into the gap (FLIP,
// transform only, so nothing animates height). With reduced motion it just commits.
export function removeRow(row, commit) {
  if (!row || reducedMotion()) return commit();
  if (row.dataset.leaving) return; // a second tap mid-exit would remove a different row
  row.dataset.leaving = "true";
  row.style.pointerEvents = "none";
  const siblings = [...row.parentElement.children].filter((element) => element !== row);
  const before = new Map(siblings.map((element) => [element, element.getBoundingClientRect().top]));
  const exit = row.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(-12px)" }], { duration: 150, easing: EASE_OUT, fill: "forwards" });
  exit.finished.then(() => {
    flushSync(commit);
    // If React reused this element for another item, make it visible and clickable again.
    exit.cancel();
    delete row.dataset.leaving;
    row.style.removeProperty("pointer-events");
    for (const [element, top] of before) {
      if (!element.isConnected) continue;
      const shift = top - element.getBoundingClientRect().top;
      if (Math.abs(shift) > 0.5) element.animate([{ transform: `translateY(${shift}px)` }, { transform: "none" }], { duration: 200, easing: EASE_OUT });
    }
  }, () => {});
}
