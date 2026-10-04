import { useRef, useState, useEffect } from "react";

// formats raw seconds into m:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function useAudio(track, onEnded) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 - 100

  // when the track changes, load it and start playing
  useEffect(() => {
    if (!audioRef.current || !track) return;
    audioRef.current.src = track.src;
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [track]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const seek = (percent) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    audioRef.current.currentTime = (percent / 100) * audioRef.current.duration;
  };

  const handlers = {
    onTimeUpdate: () => {
      const a = audioRef.current;
      if (a && a.duration) setProgress((a.currentTime / a.duration) * 100);
    },
    onEnded: () => { setIsPlaying(false); if (onEnded) onEnded(); },
  };

  return {
    audioRef, isPlaying, progress,
    togglePlay, seek, handlers,
    formatTime,
  };
}




