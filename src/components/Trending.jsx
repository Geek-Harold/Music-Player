import "./Trending.css";
import { ListPlus } from "lucide-react";

export default function Trending({ tracks, onPlay, onQueue }) {
  return <section className="trending"><h3 className="section-heading">{tracks.length ? "Trending" : "No tracks found"}</h3><ul className="trending-list">{tracks.map((track, index) => <li key={track.id} className="trending-row"><button className="trending-play" onClick={() => onPlay(track.id)} aria-label={`Play ${track.title}`}><img className="trending-thumb" src={track.cover} alt="" /><span className="trending-title">{track.title} - {track.artist}</span></button><span className="trending-rank">#{index + 1}</span>{onQueue && <button className="icon-button" onClick={() => onQueue(track.id)} aria-label={`Add ${track.title} to queue`}><ListPlus size={17} /></button>}</li>)}</ul></section>;
}
