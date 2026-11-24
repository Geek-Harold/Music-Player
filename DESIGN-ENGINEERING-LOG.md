# Design-engineering log (emil-design-eng)

A read-only review of the whole SONA front end (`src/`) against the **emil-design-eng** skill (Emil Kowalski's design-engineering rules). **No code was changed.** Each row says what the code does now, what the skill would want instead, and why. Line numbers are from the working tree on 2026-11-24, including the uncommitted animation, sorting and albums work.

> **Status, 2026-11-24:** every row in this log is now **done** (marked ✅). P3 rows marked "Kept" were judged right as they are.
>
> How the P2s landed: every top-level `:hover` rule is now inside `@media(hover:hover) and (pointer:fine)`, with `:focus-visible` and `[aria-expanded]` states split out so they stay ungated. Press feedback uses the existing `.16s var(--ease-out)` transform transition; song rows darken via `:has(>…:active)` instead of scaling. Row removal (playlist ×, queue ×, adding from suggestions) uses `removeRow()` in `motion.js`: a 150ms fade/slide out, then the rows below glide up with a 200ms FLIP (transform only, no `height`). Queue rows are now keyed by song + occurrence instead of position, so the row that leaves is the one you tapped.

**Priority:** **P1** is something users feel (a snap, a sticky state, a missing exit). **P2** is polish that adds up across the app. **P3** is optional delight or a judgement call.

**How SONA scores overall:** it's already in good shape. A previous animation pass applied most of the skill's rules: custom curves, `@starting-style` entrances, transition-based exits that can reverse mid-way, popovers that grow from their trigger, hover lifts limited to mouse users, reduced-motion fallbacks and WAAPI one-shots. Nothing uses `transition: all`, nothing animates from `scale(0)`, and no UI motion uses `ease-in`. What's left is mostly **gaps** (missing press feedback, missing exits, hover states that stick on touch screens) rather than **mistakes**.

---

## 1. Press feedback (`:active`)

The skill: *every pressable element gets a subtle `scale(0.95–0.98)` on `:active`, with a short transform transition.* SONA does this for `.ctrl-btn`, `.icon-button`, `.sort-trigger`, `.hero-shuffle`, `.playlist-tile`, `.recent-card`, `.back-link` and the sidebar items. These are still missing it:

| Before | After | Why | Where | Pri |
| --- | --- | --- | --- | --- |
| `.pd-create:active{transform:translate(1px,1px)}` with no `transition` on `.pd-create` | add `transition:transform .12s var(--ease-out),box-shadow .12s var(--ease-out)` | It snaps into its shadow while every other shadowed button eases. A press with no transition feels like a glitch | `PlaylistDialog.css:24` | P1 ✅ |
| `.pd-cancel`: hover only, no `:active` | `.pd-cancel:active{transform:scale(.97)}` + transform transition | It sits next to Create and should feel equally responsive | `PlaylistDialog.css:24` | P2 ✅ |
| `.profile-ghost`, `.profile-primary`: no `:active` | `:active{transform:scale(.97)}` + `transition:background .15s,transform .16s var(--ease-out)` | Edit, Save, Cancel and Upload buttons give no sign the tap landed | `ProfileCard.css:11` | P2 ✅ |
| `.profile-menu button`: no `:active` | `:active:not(:disabled){transform:scale(.98)}` | Menu rows are pressed often; a softer squeeze because they're wide | `ProfileCard.css:13` | P2 ✅ |
| `.settings-action`, `.settings-danger`: no `:active` | `:active:not(:disabled){transform:scale(.97)}` + transition | "Sync now" and "Clear" buttons have hover only | `Settings.css:4-5` | P2 ✅ |
| `.segmented button` (Light/Dark/System, repeat mode): no `:active` | `:active{transform:scale(.96)}` | Segmented controls are buttons too | `Settings.css:9` | P2 ✅ |
| `.switch`: background change only | `.switch:active span{width:24px}` (the iOS knob stretch), or `.switch:active{transform:scale(.96)}` | Confirms the press before the toggle lands; the knob stretch is the native-feeling version | `Settings.css:3` | P3 ✅ Done as `scaleX(1.2)` toward the knob's travel (transform, not `width`) |
| `.swatch`: no feedback | `:active{transform:scale(.92)}` + transform transition | Small round targets benefit most from visible feedback | `ProfileCard.css:15` | P2 ✅ |
| `.search-clear`, `.topbar-menu`: hover only | `:active{transform:scale(.92)}` + transition | Same family as `.icon-button`, which already has it | `App.css:5`, `App.css:33` | P2 ✅ |
| `.library-notice button` ("Choose folders"): no feedback | `:active{transform:scale(.97)}` + transition | It's the main call to action on an empty library | `App.css:21` | P2 ✅ |
| `.bar-track` (opens the full player): hover background only | `:active{transform:scale(.98)}` | It's the player bar's biggest target and opens a whole view, so the press should register first | `PlayerBar.css:11` | P2 ✅ |
| `.row-main`, `.trending-play`, `.pv-row-main` (tapping a song): no feedback | `.library-row:has(.row-main:active){background:rgba(var(--tint),.16)}`, a background darken rather than a scale | Full-width rows look odd when they shrink; darkening the background is the standard list-row press | `App.css:13`, `Trending.css:4`, `NowPlaying.css:28` | P2 ✅ |
| `.sort-list button`, `.suggestions-toggle`, `.pd-link`, `.logo`, `.topbar-logo`, `.profile>.avatar`: no feedback | `:active{transform:scale(.97)}` (background darken for list items) | Completes the rule "every pressable element" | `SortMenu.css:8`, `App.css:16`, `PlaylistDialog.css:16`, `Sidebar.css:4`, `App.css:4`, `ProfileCard.css:1` | P3 ✅ |

---

## 2. Hover states on touch screens

The skill: *gate hover effects behind `@media (hover: hover) and (pointer: fine)`, because a tap triggers hover and it sticks.* The lifts on `.playlist-tile` and `.recent-card` are already gated. These colour changes aren't, and two of them are strong enough to look like a bug on a phone:

| Before | After | Why | Where | Pri |
| --- | --- | --- | --- | --- |
| `.settings-danger:hover{background:#a2434f;color:#fff}` | move inside `@media(hover:hover) and (pointer:fine)` | After tapping "Clear history" on a phone, the button stays bright red as if something were still armed | `Settings.css:4` | P1 ✅ |
| `.settings-action:hover{background:var(--brand-dark);color:#fff}` | gate it the same way | Same issue: the button stays filled after a tap | `Settings.css:5` | P1 ✅ |
| `.playlist-tile-new:hover .playlist-new-art{background:var(--accent-yellow)}` | gate it | The "New playlist" tile stays yellow after you tap it and close the dialog | `App.css:26` | P1 ✅ |
| Background-tint hovers: `.library-row`, `.trending-row`, `.pv-row`, `.icon-button`, `.ctrl-btn`, `.nav-item`, `.playlist-link`, `.sort-trigger`, `.hero-shuffle`, `.pd-option`, `.profile-menu button`, `.menu-button`, `.search-clear`, `.topbar-menu`, `.bar-track`, `.back-link` | one shared hover-gated block for all `:hover` tints | A faint tint sticks on the last-tapped row or icon. It's subtle, but it's the "website, not an app" tell on phones | across `App.css`, `Trending.css`, `NowPlaying.css`, `Sidebar.css`, `SortMenu.css`, `PlaylistDialog.css`, `ProfileCard.css`, `PlayerBar.css` | P2 ✅ |
| `.profile>.avatar:hover` ring | gate it; keep the `[aria-expanded=true]` ring ungated | The ring should show "menu open", not "was tapped" | `ProfileCard.css:1` | P3 ✅ |
| `.bar-progress:hover` thickens the track and shows the thumb | gate the `:hover` half; keep `:focus-visible` | On touch the scrubber stays thick after seeking | `PlayerBar.css:7-9` | P3 ✅ |

---

## 3. Easing and duration

| Before | After | Why | Where | Pri |
| --- | --- | --- | --- | --- |
| `.playlist-tile .playlist-cover,.playlist-new-art{transition:transform .15s}` (default `ease`) | `transition:transform .2s var(--ease-out)` | The hover lift is a movement; the project's strong ease-out curve makes it feel intentional rather than generic | `App.css:24` | P2 ✅ |
| `.recent-art{transition:transform .15s}` (default `ease`) | `transition:transform .2s var(--ease-out)` | Same lift, same curve, so the Home and Collection grids feel identical | `RecentlyPlayed.css:3` | P2 ✅ |
| `.pv-disc` `disc-out` `.5s var(--ease-drawer)` on every track change | `.4s`, same curve | It plays on every song, which is a high-frequency surface. Half a second is long enough to feel slow when skipping through tracks. It's decorative, so trimming it costs nothing | `NowPlaying.css:9` | P3 ✅ |
| `pop()` heart: 360ms, peaking at `scale(1.3)` | keep, or `300ms` with a `1.25` peak | It's a rare, deliberate delight on an action the user chose, so a longer duration is allowed. It's on the edge of the 300ms guideline; only trim it if it feels slow | `motion.js:7` | P3 ✅ Kept at 360ms: it only plays on a deliberate like |
| `.splash-disc{animation:spin 2s linear infinite}` | `1.2s` | The skill: a faster spinner makes loading *feel* faster. 2s per turn reads as sluggish while the library syncs | `App.css:20` | P2 ✅ |
| Theme crossfade `::view-transition-*` `.22s ease` | keep | A colour change uses `ease`, and it's under 300ms. This one is correct | `index.css` (last line) | — |

---

## 4. Enter and exit pairs

The skill: *things should leave the way they came, exits faster than entrances, and transitions (which can reverse mid-way) over keyframes for anything the user can trigger quickly.* The dialog, drawer, sort menu and profile card all follow this through `usePresence`. These don't:

| Before | After | Why | Where | Pri |
| --- | --- | --- | --- | --- |
| Full player: enters with a `pv-in` keyframe (rises 16px), then **disappears instantly** when closed (chevron, bar tap or Esc) | Render it through `usePresence`, use a transition instead of the keyframe, and exit with `translateY(16px)`, `opacity:0` in about 180ms | Spatial consistency: it rises out of the bar, so it should sink back into it. A keyframe also can't reverse if you toggle quickly. Esc is a keyboard action, so either close instantly on Esc or keep that exit very short | `App.css:40-41`, `App.jsx` (`playerOpen`) | P1 ✅ Done: 260ms in / 180ms out as transitions; Esc and search typing close instantly. `usePresence` gained a `{ subtree: false }` option so the player waits only for its own fade, not the record slide inside it |
| Removing a song from a playlist (×) or the queue (×): the row disappears and everything below jumps up | Exit the row with `opacity` → 0 and a short height collapse, about 180ms (or a FLIP on the rows below) | Removing a list item with no transition is the classic jarring change, and it's hard to tell which row went | `App.jsx` (`trackList`, `removeFromPlaylist`), `NowPlaying.jsx:9` | P2 ✅ |
| "Add tracks" suggestions: an added song disappears from the list instantly | Same short exit, or briefly show the `QueueButton`-style tick before it leaves | Confirms the add, which would otherwise feel like the row was deleted | `App.jsx` (suggestions block) | P2 ✅ |
| "Add tracks" toggle: the suggestion list appears and disappears instantly | Leave it instant, or a 150ms opacity fade on open only | It's a disclosure the user opens occasionally. Instant is acceptable; a fade-in is the most it needs | `App.jsx` (`showPlaylistSuggestions`) | P3 ✅ Rows fade in over 150ms via `@starting-style` |
| `.pd-check` tick appears instantly while the box colour transitions over 120ms | Animate the check icon in from `scale(.8)` with `opacity:0` over 140ms ease-out | The colour fades but the tick pops, so they're out of sync. Matching them makes the checkbox read as one motion | `PlaylistDialog.css:20` | P3 ✅ Tick uses the `icon-in` scale/opacity entrance, 140ms |

---

## 5. Icon swaps

| Before | After | Why | Where | Pri |
| --- | --- | --- | --- | --- |
| `@keyframes icon-in{from{opacity:0;transform:scale(.6)}}` on play/pause and the queue tick | start from `scale(.85)` | The skill says never start near zero; `.9`+ is the guideline. At `.6` the icon visibly grows out of a dot on every play/pause, the most-pressed control in the app | `App.css:50-51` | P2 ✅ |
| `.play-btn svg` animates whenever the icon mounts, including every time the full player opens and during the opening "arriving" sequence | apply it only on a real swap, e.g. key the icon and add a `data-swapped` class only after a toggle | The animation should mean "state changed". Here it also plays when nothing changed, which dilutes it | `App.css:50`, `PlayerBar.jsx:14`, `NowPlaying.jsx:22` | P3 ✅ New `useHasChanged` hook; the icon animates only after `isPlaying` actually changes |
| Play/pause swap is a hard swap with a scale-in | optional: crossfade with `filter:blur(2px)` at the midpoint | The skill's trick for two shapes swapping, which reads as one morph instead of two icons. Optional polish | same | P3 ✅ `icon-swap` keyframe: scale .85 + 2px blur → sharp, 160ms (opacity only under reduced motion) |

---

## 6. Keyboard and high-frequency actions

The skill: *never animate keyboard-initiated actions; reduce motion on things seen tens of times a day.*

| Before | After | Why | Where | Pri |
| --- | --- | --- | --- | --- |
| `M` (mute) toggles `.mute-btn.selected`, whose background fades over `.15s` | keep, or `transition:none` on `.mute-btn` | Strictly a keyboard-triggered animation, but it's a 150ms colour change on a small icon, so it's harmless. Logged for completeness | `PlayerBar.css:12`, `App.css:10` | P3 ✅ `.mute-btn`/`.settings-mute` now transition transform only, so the colour swap is instant |
| Esc closes the full player, the drawer, the profile card and the sort menu | full player: instant (as now); drawer, menu and card: keep their short exits (120–220ms) | Esc is keyboard, but those exits are already short and faster than their entrances, so they pass. If the full player gets an exit (section 4), skip it when closed with Esc | `App.jsx`, `Sidebar.css:22`, `SortMenu.css:6`, `ProfileCard.css:5` | P3 ✅ Already true after the P1 work |
| Search: typing re-renders the results instantly | keep | Correct: no animation on keystrokes | `App.jsx` | — |
| Switching views (Home, Browse, Albums…) is instant | keep | Correct: navigation happens tens of times a day. The opening "arriving" stagger is limited to the first load, which is exactly right | `App.css:53-56` | — |
| `.track-swap` (title and art ease in on each new song, 240ms) | keep | High frequency, but short, opacity plus 4px, and it explains the change. This is the right weight | `App.css:47-48` | — |

---

## 7. Tooltips

| Before | After | Why | Where | Pri |
| --- | --- | --- | --- | --- |
| Native `title` tooltips on the icon rail, mute (`(M)`), shuffle and repeat | a small custom tooltip: delay about 400ms on the first, then **instant with no animation** for neighbours while one is open, 125ms ease-out, `scale(.97)` + opacity, grows from the trigger | The skill's tooltip rule. Native titles have a long fixed delay and don't match the theme. On the collapsed rail they're the only labels, so they're used a lot | `Sidebar.jsx` (rail `title`), `PlayerBar.jsx:23`, `PlaybackModes.jsx:8,14` | P3 ✅ `Tooltips.jsx`: 500ms first delay, instant for neighbours within 300ms, 125ms ease-out from the trigger side, 80ms exit, mouse and keyboard focus only |

---

## 8. Accessibility (reduced motion)

Covered well: the full player, track swap, icon swap, arriving stagger, player bar, playing bars, vinyl, sidebar morph, drawer, dialog, sort menu, profile card and `pop()`. The remaining items:

| Before | After | Why | Where | Pri |
| --- | --- | --- | --- | --- |
| `.splash-disc` and `.spin` keep rotating under reduced motion | keep spinning but slower (e.g. 3s), or swap for an opacity pulse | Loading indicators may keep moving, but a constantly rotating disc is exactly the motion some users opt out of. "Fewer and gentler", not none | `App.css:20`, `Settings.css:7` | P3 ✅ Spinners slow to 3s / 2.5s under reduced motion |
| Press scales (`:active` transforms) stay on under reduced motion | keep | Correct: tiny, user-initiated and confirmatory | — | — |

---

## 9. Performance

| Before | After | Why | Where | Pri |
| --- | --- | --- | --- | --- |
| `.thumb .playing-bars` animate `scaleY` | keep | Correct: compositor-only, with uneven durations so they never line up | `PlayingBars.css:5-8` | — |
| Sidebar collapse is a FLIP with `transform` on content and a `::before` panel; labels fade after the panel makes room | keep | Exactly the skill's "only transform and opacity" rule. Cancels and restarts from the current position when toggled again | `sidebarMorph.js` | — |
| `.bar-progress` track height jumps 3px → 5px on hover | keep (can't be transformed on a range-track pseudo-element), or draw the track as a separate element and `scaleY` it | Height can't animate cheaply here; the snap is small. Logged only because it's the one layout-property state change in the motion layer | `PlayerBar.css:7` | P3 ✅ Kept: a range track can't take a transform |
| `--progress` custom property updated on every `timeupdate` on `.bar-progress` | keep | It's set on the input itself, not a parent, so there's no inherited recalculation. That's the case the skill warns about, and it's avoided | `PlayerBar.jsx:11` | — |
| `.playlist-dialog::backdrop{backdrop-filter:blur(2px)}` | keep | Light blur, well under the skill's 20px ceiling | `PlaylistDialog.css:2` | — |

---

## 10. Already right (keep these)

Logged so nobody "fixes" them later:

| What | Why it follows the skill | Where |
| --- | --- | --- |
| `--ease-out:cubic-bezier(.23,1,.32,1)` and `--ease-drawer:cubic-bezier(.32,.72,0,1)` tokens | These are the skill's recommended curves, used everywhere | `index.css` `:root` |
| `usePresence` + `data-state` + CSS transitions for exits | Interruptible: reopening mid-exit reverses smoothly instead of restarting | `hooks/usePresence.js` |
| Sort menu and profile card `transform-origin:top right`, `scale(.95/.96)` | Popovers grow from their trigger, never from `scale(0)` | `SortMenu.css:3-6`, `ProfileCard.css:2-5` |
| Playlist dialog centred, `translateY(12px) scale(.96)`, enters in 240ms and exits in 180ms | Modals stay centred, and the exit is faster than the entrance | `PlaylistDialog.css:5-7` |
| Drawer: 300ms on the iOS curve, 220ms exit, extra 40px hides the shadow, `translateX` by percent | Percentage translate, drawer curve, asymmetric timing | `Sidebar.css:17-22` |
| Hover lifts gated by `(hover:hover) and (pointer:fine)` | The skill's touch rule | `App.css:24`, `RecentlyPlayed.css:4` |
| `pop()` heart only on like, never on unlike or on mount | Animation with a purpose: feedback on the user's own action | `motion.js`, `PlayerBar.jsx:20` |
| Queue button turns into a tick for 1.2s | Feedback where nothing else on screen changes | `QueueButton.jsx` |
| Vinyl spin-up uses ease-**in** and coasts down with ease-out | The one valid `ease-in`: a motor accelerating. The ramp speed matches the steady spin, so there's no seam | `VinylDisc.jsx` |
| Opening stagger at 60ms steps, first load only | Inside the skill's 30–80ms range and never on later navigation | `App.css:53-56` |
| Theme switch is a 220ms crossfade, opacity only, still on under reduced motion | Colour change with `ease`; reduced motion keeps comprehension-aiding fades | `App.jsx` `changeTheme`, `index.css` |
| `.hero-play`/`.play-btn` press *into* their offset shadow (translate) while flat buttons scale | Intentional: shadowed buttons go "down", flat ones squeeze. Consistent within each family | `App.css:11,28` |
| Albums: no transition between grid and album page; tile lift + `scale(.97)` press reused | Navigation stays instant; tiles share one behaviour with playlist tiles | `App.css:62-65` |

---

## Suggested order if you act on this

1. **P1s**, about 30 lines of CSS plus one `usePresence` hookup: gate the three loud hovers, add the missing `.pd-create` transition, and give the full player an exit that mirrors its entrance.
2. **The press-feedback sweep** (section 1) and **the shared hover gate** (section 2) as one pass. Both are mechanical.
3. **Easing touch-ups** (tile lift curves, splash spin speed) and the `icon-in` start scale.
4. **List-item exits** (playlist and queue removal).
5. **P3s** as taste dictates: custom tooltips, knob stretch, checkbox tick, play/pause blur morph.

Per `CLAUDE.md`, run `animation-performance` before shipping the list-item exits. They're the one place where it's tempting to reach for `height`.
