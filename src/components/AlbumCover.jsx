import PlaylistCover from "./PlaylistCover";

// An album's artwork is its first song's cover. "Unknown album" mixes covers, so it gets the playlist mosaic.
export default function AlbumCover({ album, className = "" }) {
  if (!album.known) return <PlaylistCover tracks={album.tracks} className={className} />;
  return <div className={`playlist-cover ${className}`} aria-hidden="true"><img src={album.tracks[0].cover} alt="" loading="lazy" /></div>;
}
