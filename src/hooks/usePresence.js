import { useEffect, useState } from "react";

// Keeps a closing element mounted until its CSS exit transition finishes, so
// menus, the drawer and dialogs can animate out instead of vanishing.
// Render the element while `present`, give it data-state={state}, and attach `ref`.
// Reopening mid-exit just flips the state back; the transition retargets.
// `subtree: false` waits only for the element's own transitions, for big views whose children
// run long decorative animations of their own (the full player's record slide, vinyl spin-up).
export default function usePresence(open, ref, { subtree = true } = {}) {
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);

  useEffect(() => {
    if (open || !shown) return;
    let cancelled = false;
    // Only finite animations: an infinite spinner inside would never finish.
    const running = (ref.current?.getAnimations({ subtree }) ?? []).filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity);
    Promise.allSettled(running.map((animation) => animation.finished)).then(() => { if (!cancelled) setShown(false); });
    return () => { cancelled = true; };
  }, [open, shown, ref, subtree]);

  return { present: open || shown, state: open ? "open" : "closed" };
}
