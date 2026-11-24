import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./Tooltips.css";
import usePresence from "../hooks/usePresence";

const DELAY = 500; // before the first tooltip, so passing over an icon doesn't flash one
const GRACE = 300; // after one closes, the next opens instantly (moving along a toolbar)
const GAP = 8;
const EDGE = 8;

// One tooltip for the whole app. Any element with data-tooltip="…" gets it on mouse
// hover or keyboard focus (never on touch); data-tooltip-side="right" puts it beside
// the element instead of above. Elements keep their aria-label for screen readers.
export default function Tooltips() {
  const [tip, setTip] = useState(null); // { text, rect, side, instant }
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timer = useRef(0);
  const target = useRef(null);
  const closedAt = useRef(-Infinity);
  const { present, state } = usePresence(open, ref);

  useEffect(() => {
    const show = (element, instant) => {
      target.current = element;
      setTip({ text: element.dataset.tooltip, rect: element.getBoundingClientRect(), side: element.dataset.tooltipSide ?? "top", instant });
      setOpen(true);
    };
    const hide = () => {
      clearTimeout(timer.current);
      if (target.current) closedAt.current = performance.now();
      target.current = null;
      setOpen(false);
    };
    const enter = (element) => {
      if (!element || element === target.current) return;
      clearTimeout(timer.current);
      // Already showing one, or just closed one: skip both the delay and the animation.
      if (target.current || performance.now() - closedAt.current < GRACE) return show(element, true);
      timer.current = setTimeout(() => show(element, false), DELAY);
    };
    const onOver = (event) => {
      if (event.pointerType !== "mouse") return;
      const element = event.target.closest?.("[data-tooltip]");
      if (element) enter(element);
      else if (target.current || timer.current) hide();
    };
    const onFocus = (event) => { const element = event.target.closest?.("[data-tooltip]"); if (element?.matches(":focus-visible")) enter(element); };
    const onOut = (event) => { if (event.pointerType === "mouse" && !event.relatedTarget?.closest?.("[data-tooltip]")) hide(); };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", hide);
    // Pressing the control, typing or scrolling should never leave a tooltip in the way.
    document.addEventListener("pointerdown", hide, true);
    document.addEventListener("keydown", hide, true);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      clearTimeout(timer.current);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("pointerdown", hide, true);
      document.removeEventListener("keydown", hide, true);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, []);

  // Keep a tooltip above a toolbar on screen: nudge it in from the window edges.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !tip || tip.side !== "top") return;
    element.style.removeProperty("--nudge");
    const { left, right } = element.getBoundingClientRect();
    const nudge = left < EDGE ? EDGE - left : right > window.innerWidth - EDGE ? window.innerWidth - EDGE - right : 0;
    if (nudge) element.style.setProperty("--nudge", `${nudge}px`);
  }, [tip, present]);

  if (!present || !tip) return null;
  const { rect, side } = tip;
  const position = side === "right" ? { left: rect.right + GAP, top: rect.top + rect.height / 2 } : { left: rect.left + rect.width / 2, top: rect.top - GAP };
  return <div ref={ref} className="tooltip" role="tooltip" aria-hidden="true" data-side={side} data-state={state} data-instant={tip.instant || undefined} style={position}>{tip.text}</div>;
}
