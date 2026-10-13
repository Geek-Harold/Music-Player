import { useCallback, useEffect, useRef, useState } from "react";

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export default function useAudio(track, onEnded, repeat = false) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const element = audioRef.current;
    if (!element || !track) return;
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setError("");
    setIsLoading(true);
    element.src = track.src;
    element.load();
    element.play().catch(() => {
      setIsPlaying(false);
      setIsLoading(false);
      setError("Playback could not start. Press play to try again.");
    });
  }, [track]);

  const togglePlay = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;
    if (!element.paused) element.pause();
    else {
      setError("");
      element.play().catch(() => setError("Playback could not start. Check the audio source and try again."));
    }
  }, []);

  const seek = useCallback((seconds) => {
    const element = audioRef.current;
    if (element && Number.isFinite(element.duration)) element.currentTime = Math.max(0, Math.min(seconds, element.duration));
  }, []);
  const restart = useCallback(() => {
    const element = audioRef.current;
    if (element) element.currentTime = 0;
  }, []);

  const handlers = {
    onPlay: () => { setIsPlaying(true); setError(""); },
    onPause: () => setIsPlaying(false),
    onCanPlay: () => setIsLoading(false),
    onWaiting: () => setIsLoading(true),
    onTimeUpdate: (event) => {
      const element = event.currentTarget;
      if (Number.isFinite(element.duration) && element.duration > 0) {
        setDuration(element.duration);
        setProgress((element.currentTime / element.duration) * 100);
      }
    },
    onLoadedMetadata: (event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0),
    onEnded: () => {
      if (repeat && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => setError("Playback could not restart."));
      } else { setIsPlaying(false); onEnded?.(); }
    },
    onError: () => { setIsPlaying(false); setIsLoading(false); setError("This track could not be loaded."); },
  };

  return { audioRef, isPlaying, isLoading, progress, duration, error, togglePlay, seek, restart, handlers, formatTime };
}
