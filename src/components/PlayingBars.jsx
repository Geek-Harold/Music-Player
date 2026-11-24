import "./PlayingBars.css";

// Three little equaliser bars laid over the artwork of the track that's playing.
// They bounce while it plays and settle low when paused.
export default function PlayingBars({ playing }) {
  return <span className={`playing-bars ${playing ? "on" : ""}`} aria-hidden="true"><span /><span /><span /></span>;
}
