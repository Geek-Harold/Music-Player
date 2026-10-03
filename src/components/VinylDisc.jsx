import "./VinylDisc.css";
import { currentTrack } from "../data/tracks";

export default function VinylDisc() {
  return (
    <div className="vinyl-panel">
      <div className="vinyl">
        <div className="vinyl-label">
          <div className="waveform">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                style={{ height: `${18 + ((i * 7) % 5) * 12}px` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="vinyl-time">
        {currentTrack.currentTime} / {currentTrack.duration}
      </div>
    </div>
  );
}
