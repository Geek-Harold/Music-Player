import "./PlaylistCover.css";
import { ListMusic } from "lucide-react";

// A playlist's artwork: an empty sleeve, the first song's cover, or a 2×2 mosaic once it has four songs.
export default function PlaylistCover({ tracks, className = "" }) {
  const covers = tracks.slice(0, 4).map((track) => track.cover);
  if (!covers.length) return <div className={`playlist-cover empty ${className}`} aria-hidden="true"><ListMusic size={32} /></div>;
  if (covers.length < 4) return <div className={`playlist-cover ${className}`} aria-hidden="true"><img src={covers[0]} alt="" /></div>;
  return <div className={`playlist-cover mosaic ${className}`} aria-hidden="true">{covers.map((cover, index) => <img key={index} src={cover} alt="" />)}</div>;
}
