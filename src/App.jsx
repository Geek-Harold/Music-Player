import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import NowPlaying from "./components/NowPlaying";
import RecentlyPlayed from "./components/RecentlyPlayed";
import Trending from "./components/Trending";
import VinylDisc from "./components/VinylDisc";
import useAudio from "./hooks/useAudio";
import { playlist } from "./data/tracks";

export default function App() {
  const [currentId, setCurrentId] = useState(playlist[0].id);
  const [liked, setLiked] = useState(false);
  const track = playlist.find((t) => t.id === currentId);

  const audio = useAudio(track, () => {
    // called when a track ends: play the next one
    const index = playlist.findIndex((t) => t.id === currentId);
    const next = playlist[(index + 1) % playlist.length];
    setCurrentId(next.id);
  });

  const playTrack = (id) => {
    setCurrentId(id);
    setLiked(false);
  };

  const skipForward = () => {
    const index = playlist.findIndex((t) => t.id === currentId);
    playTrack(playlist[(index + 1) % playlist.length].id);
  };

  const skipBack = () => {
    // if we're more than 3s in, restart the song instead
    const a = audio.audioRef.current;
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
    } else {
      const index = playlist.findIndex((t) => t.id === currentId);
      playTrack(playlist[(index - 1 + playlist.length) % playlist.length].id);
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <NowPlaying
          track={track}
          audio={audio}
          liked={liked}
          onLike={() => setLiked(!liked)}
          onSkipForward={skipForward}
          onSkipBack={skipBack}
        />
        <RecentlyPlayed tracks={playlist} onPlay={playTrack} />
        <Trending tracks={playlist} onPlay={playTrack} />
      </main>
      <VinylDisc track={track} audio={audio} />
      <audio ref={audio.audioRef} {...audio.handlers} />
    </div>
  );
}
