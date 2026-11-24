// Animates the desktop sidebar between full width and the icon rail using only
// transform and opacity, so it stays on the compositor (FLIP):
//   1. before the toggle, note where the content's left edge is on screen;
//   2. React switches the grid column instantly;
//   3. the content slides from the old edge to the new one, and the sidebar's
//      background panel (a ::before, see .sidebar-morphing) follows the same edge.
// Toggling again mid-way starts from wherever things are on screen right now.
const ID = "sidebar-morph";
const OPTIONS = { id: ID, duration: 280, easing: "cubic-bezier(.32,.72,0,1)" };

const partsOf = (app) => ({ sidebar: app?.querySelector(":scope > .sidebar"), content: app?.querySelector(":scope > .content") });

export function measureSidebarEdge(app) {
  const { content } = partsOf(app);
  return content ? content.getBoundingClientRect().left : null;
}

export function morphSidebar(app, fromEdge) {
  const { sidebar, content } = partsOf(app);
  if (!sidebar || !content || fromEdge === null) return;
  for (const element of [sidebar, content]) element.getAnimations({ subtree: true }).forEach((animation) => { if (animation.id === ID) animation.cancel(); });
  const settle = () => { sidebar.classList.remove("sidebar-morphing"); sidebar.style.removeProperty("--panel-width"); };
  settle();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const width = sidebar.getBoundingClientRect().width;
  const shift = fromEdge - content.getBoundingClientRect().left;
  if (Math.abs(shift) < 1) return;
  const fromWidth = width + shift;
  const panelWidth = Math.max(width, fromWidth);

  content.animate([{ transform: `translateX(${shift}px)` }, { transform: "none" }], OPTIONS);
  sidebar.classList.add("sidebar-morphing");
  sidebar.style.setProperty("--panel-width", `${panelWidth}px`);
  const panel = sidebar.animate([{ transform: `translateX(${fromWidth - panelWidth}px)` }, { transform: `translateX(${width - panelWidth}px)` }], { ...OPTIONS, pseudoElement: "::before" });
  // The new labels wait until there's room for them, so they never spill over the content.
  const hold = shift < 0 ? 0.4 : 0;
  sidebar.querySelectorAll(":scope > nav, :scope > .sidebar-library, .logo").forEach((element) => element.animate([{ opacity: 0 }, { opacity: 0, offset: hold }, { opacity: 1 }], OPTIONS));
  panel.finished.then(settle, () => {});
}
