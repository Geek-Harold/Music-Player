import "./NowPlaying.css";
import { currentTrack, upNext } from "../data/tracks";

export default function NowPlaying() {
  return (
    <section className="now-playing">
      <div className="np-main">
        <div className="album-art">
          <span className="art-spine">IRON MAIDEN</span>
          <div className="art-image">??</div>
        </div>

        <div className="np-info">
          <h2 className="np-title">{currentTrack.title}</h2>
          <p className="np-artist">{currentTrack.artist}</p>

          <div className="np-progress">
            <span>{currentTrack.currentTime}</span>
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
            <span>{currentTrack.duration}</span>
          </div>

          <div className="np-controls">
            <button className="ctrl-btn like">?</button>
            <button className="ctrl-btn">?</button>
            <button className="play-btn">?</button>
            <button className="ctrl-btn">?</button>
            <button className="ctrl-btn">?</button>
          </div>

          <span className="rpm-badge">{currentTrack.rpm}</span>
        </div>
      </div>

      <div className="up-next">
        <p className="up-next-label">UP NEXT</p>
        <div className="up-next-row">
          <div className="up-next-thumb" />
          <span className="up-next-title">
            {upNext.title} - {upNext.artist}
          </span>
          <span className="up-next-duration">{upNext.duration}</span>
        </div>
      </div>
    </section>
  );
}
