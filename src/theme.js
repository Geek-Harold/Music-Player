import { useEffect, useState } from "react";

export const THEMES = ["light", "dark", "system"];
const BROWSER_BAR = { light: "#f0e9de", dark: "#1c161d" };
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function readTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem("sona:theme"));
    return THEMES.includes(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

// "light"/"dark" pin the palette with <html data-theme>; "system" removes it so
// the prefers-color-scheme rules in index.css take over again.
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  localStorage.setItem("sona:theme", JSON.stringify(theme));
  // The phone browser bar colour: each <meta> is scoped to a system scheme, so
  // a pinned theme overrides both, and "system" puts the originals back.
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    const own = meta.media.includes("dark") ? BROWSER_BAR.dark : BROWSER_BAR.light;
    meta.content = theme === "system" ? own : BROWSER_BAR[theme];
  });
}

// Whether the device itself is in dark mode right now (updates live).
export function useSystemDark() {
  const [dark, setDark] = useState(() => darkQuery().matches);
  useEffect(() => {
    const query = darkQuery();
    const onChange = (event) => setDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return dark;
}
