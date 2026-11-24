import "./Trending.css";
import PlayingBars from "./PlayingBars";
import QueueButton from "./QueueButton";
import { ListPlus } from "lucide-react";

export default function Trending({ title = "Trending", tracks, onPlay, onQueue, ranked = false, currentId, playing }) {
  return <section className="shelf"><h3 className="section-heading">{tracks.length ? title : "No tracks found"}</h3><ul className={`trending-list ${ranked ? "ranked" : ""}`}>{tracks.map((track, index) => <li key={track.id} className={`trending-row ${track.id === currentId ? "current" : ""}`}>{ranked && <span className="trending-rank">{index + 1}</span>}<button className="trending-play" onClick={() => onPlay(track.id)} aria-label={`Play ${track.title}`}><span className="thumb"><img className="trending-thumb" src={track.cover} alt="" />{track.id === currentId && <PlayingBars playing={playing} />}</span><span className="trending-text"><strong>{track.title}</strong><small>{track.artist}</small></span></button>{onQueue && <QueueButton title={track.title} onAdd={() => onQueue(track.id)} icon={ListPlus} size={17} />}</li>)}</ul></section>;
}
