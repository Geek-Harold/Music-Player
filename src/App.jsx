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
  const track = playlist.find((t) => t.id === currentId);
  const audio = useAudio(track);

  const playTrack = (id) => setCurrentId(id);

  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <NowPlaying track={track} audio={audio} onSkip={() => playTrack(playlist[(currentId % playlist.length) + 1 - 1]?.id ?? playlist[0].id)} />
        <RecentlyPlayed tracks={playlist} onPlay={playTrack} />
        <Trending tracks={playlist} onPlay={playTrack} />
      </main>
      <VinylDisc track={track} audio={audio} />
      {/* the actual audio element - invisible, but does the work */}
      <audio ref={audio.audioRef} {...audio.handlers} />
    </div>
  );
}
