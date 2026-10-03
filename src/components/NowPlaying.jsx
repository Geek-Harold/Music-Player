import "./NowPlaying.css";
import { playlist } from "../data/tracks";
import { Heart, SkipBack, Play, SkipForward, Ellipsis, Pause } from "lucide-react";

export default function NowPlaying({ track, audio, onSkip }) {
  const { isPlaying, progress, togglePlay, formatTime } = audio;
  const index = playlist.findIndex((t) => t.id === track.id);
  const nextTrack = playlist[(index + 1) % playlist.length];

  return (
    <section className="now-playing">
      <div className="np-main">
        <div className="album-art">
          <span className="art-spine">{track.artist.toUpperCase()}</span>
          <div className="art-image" />
        </div>

        <div className="np-info">
          <h2 className="np-title">{track.title}</h2>
          <p className="np-artist">{track.artist}</p>

          <div className="np-progress">
            <span>{formatTime((progress / 100) * (audio.audioRef.current?.duration || 0))}</span>
            <div
              className="progress-bar"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                audio.seek(((e.clientX - rect.left) / rect.width) * 100);
              }}
            >
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span>{track.duration}</span>
          </div>

          <div className="np-controls">
            <button className="ctrl-btn like"><Heart size={20} /></button>
            <button className="ctrl-btn"><SkipBack size={20} /></button>
            <button className="play-btn" onClick={togglePlay}>
              {isPlaying
                ? <Pause size={26} fill="currentColor" />
                : <Play size={26} fill="currentColor" />}
            </button>
            <button className="ctrl-btn" onClick={onSkip}><SkipForward size={20} /></button>
            <button className="ctrl-btn"><Ellipsis size={20} /></button>
          </div>

          <span className="rpm-badge">{track.rpm}</span>
        </div>
      </div>

      <div className="up-next">
        <p className="up-next-label">UP NEXT</p>
        <div className="up-next-row">
          <div className="up-next-thumb" />
          <span className="up-next-title">
            {nextTrack.title} - {nextTrack.artist}
          </span>
          <span className="up-next-duration">{nextTrack.duration}</span>
        </div>
      </div>
    </section>
  );
}
