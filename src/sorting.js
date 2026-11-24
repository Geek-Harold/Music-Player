// Sort options shown in the "Sort" menu. "default" keeps each list's natural
// order (library order, playlist order, most recently liked/played first).
export const SORT_OPTIONS = [
  { value: "default", label: null },
  { value: "title", label: "Title (A–Z)" },
  { value: "title-desc", label: "Title (Z–A)" },
  { value: "artist", label: "Artist (A–Z)" },
  { value: "album", label: "Album (A–Z)" },
  { value: "added", label: "Recently added" },
  { value: "shortest", label: "Shortest first" },
  { value: "longest", label: "Longest first" },
];

// Natural, case-insensitive text order, so "2 - Song" comes before "10 - Song".
const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
// NFKC turns stylised letters some uploads use (𝐁𝐨𝐥𝐝, ｆｕｌｌｗｉｄｔｈ) into plain ones,
// so "𝐀 𝐋𝐢𝐭𝐭𝐥𝐞 𝐃𝐞𝐚𝐭𝐡" files under A. Cached because sorting compares each title many times.
const plainCache = new Map();
const plain = (value = "") => {
  if (!plainCache.has(value)) plainCache.set(value, value.normalize("NFKC"));
  return plainCache.get(value);
};
const text = (a, b) => collator.compare(plain(a ?? ""), plain(b ?? ""));
// The same text order, for lists that aren't tracks (albums…).
export const compareText = text;
// Library tracks carry `seconds`; the sample tracks only have "m:ss", so read that instead.
const secondsOf = (track) => track.seconds ?? track.duration?.split(":").reduce((total, part) => total * 60 + Number(part), 0) ?? 0;
// Tracks without an album sort after the ones that have one.
const albumOf = (track) => track.album || "￿";

const COMPARE = {
  title: (a, b) => text(a.title, b.title),
  "title-desc": (a, b) => text(b.title, a.title),
  artist: (a, b) => text(a.artist, b.artist) || text(albumOf(a), albumOf(b)) || text(a.title, b.title),
  album: (a, b) => text(albumOf(a), albumOf(b)) || text(a.title, b.title),
  added: (a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0) || text(a.title, b.title),
  shortest: (a, b) => secondsOf(a) - secondsOf(b) || text(a.title, b.title),
  longest: (a, b) => secondsOf(b) - secondsOf(a) || text(a.title, b.title),
};

export const isSortKey = (value) => SORT_OPTIONS.some((option) => option.value === value);

export function sortTracks(list, key) {
  const compare = COMPARE[key];
  return compare ? [...list].sort(compare) : list;
}
