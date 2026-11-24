import { useState } from "react";

// True once `value` has changed at least once since this component mounted.
// Lets a swap animation play on a real change (play → pause) but not when the
// control first appears, e.g. every time the full player opens.
export default function useHasChanged(value) {
  const [first] = useState(value);
  const [changed, setChanged] = useState(false);
  if (!changed && value !== first) setChanged(true);
  return changed;
}
