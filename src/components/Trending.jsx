import "./Trending.css";
import { ListPlus } from "lucide-react";

export default function Trending({ title = "Trending", tracks, onPlay, onQueue, ranked = false }) {
  return <section className="shelf"><h3 className="section-heading">{tracks.length ? title : "No tracks found"}</h3><ul className={`trending-list ${ranked ? "ranked" : ""}`}>{tracks.map((track, index) => <li key={track.id} className="trending-row">{ranked && <span className="trending-rank">{index + 1}</span>}<button className="trending-play" onClick={() => onPlay(track.id)} aria-label={`Play ${track.title}`}><img className="trending-thumb" src={track.cover} alt="" /><span className="trending-text"><strong>{track.title}</strong><small>{track.artist}</small></span></button>{onQueue && <button className="icon-button" onClick={() => onQueue(track.id)} aria-label={`Add ${track.title} to queue`}><ListPlus size={17} /></button>}</li>)}</ul></section>;
}
