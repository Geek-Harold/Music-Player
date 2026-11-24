import { useEffect, useState } from "react";
import { Check } from "lucide-react";

// "Add to queue" with a moment of confirmation: the icon turns into a tick for a
// beat, so you know the tap landed even though nothing else on screen changes.
export default function QueueButton({ title, onAdd, icon: Icon, size = 18 }) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(timer);
  }, [added]);
  return <button className={`icon-button queue-button ${added ? "added" : ""}`} aria-label={added ? `${title} added to queue` : `Add ${title} to queue`} onClick={() => { onAdd(); setAdded(true); }}>{added ? <Check key="added" size={size} /> : <Icon key="add" size={size} />}</button>;
}
