import { compareText } from "./sorting";

export const UNKNOWN_ALBUM = "unknown";

// Same album name and album artist = same album. Case and stylised letters don't split one.
const keyOf = (track) => `${track.album}\u0000${track.albumArtist ?? ""}`.normalize("NFKC").toLowerCase();
// Disc, then track number; songs without a number keep title order after the numbered ones.
const byPosition = (a, b) => (a.discNo ?? 1) - (b.discNo ?? 1) || (a.trackNo ?? Infinity) - (b.trackNo ?? Infinity) || compareText(a.title, b.title);
// The sample tracks only carry "m:ss".
const secondsOf = (track) => track.seconds ?? track.duration?.split(":").reduce((total, part) => total * 60 + Number(part), 0) ?? 0;
const artistOf =(tracks) => {
  const artists = new Set(tracks.map((track) => track.artist));
  return tracks[0].albumArtist || (artists.size === 1 ? tracks[0].artist : "Various artists");
};

// Groups the library into albums, A–Z. Songs with no album tag share one "Unknown album" at the end.
export function groupAlbums(tracks) {
  const groups = new Map();
  for (const track of tracks) {
    const key = track.album ? keyOf(track) : UNKNOWN_ALBUM;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(track);
  }
  const albums = [...groups].map(([id, list]) => {
    const sorted = [...list].sort(byPosition);
    const known = id !== UNKNOWN_ALBUM;
    return { id, known, name: known ? sorted[0].album : "Unknown album", artist: known ? artistOf(sorted) : "Untagged songs", tracks: sorted, seconds: sorted.reduce((total, track) => total + secondsOf(track), 0) };
  });
  return albums.sort((a, b) => (a.known === b.known ? compareText(a.name, b.name) : a.known ? -1 : 1));
}

// "42 min" or "1 hr 5 min", for an album's total length.
export const formatLength = (seconds) => {
  const minutes = Math.round(seconds / 60);
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
};
