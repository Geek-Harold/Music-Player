import { useCallback, useEffect, useRef, useState } from "react";

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

// `resumeAt` (seconds) is where the first track starts, e.g. the spot you were at before a refresh.
export default function useAudio(track, onEnded, repeat = false, resumeAt = 0) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Browsers block (and users dislike) sound on page load, so the first track
  // only loads; anything picked after that starts playing straight away.
  // Keyed on the file, not the track object: a library re-sync hands us fresh
  // objects for the same songs, and that must not restart playback.
  const src = track?.src;
  const initialSrc = useRef(src);
  const startedRef = useRef(false);
  const resumeRef = useRef(resumeAt);

  useEffect(() => {
    const element = audioRef.current;
    if (!element || !src) return;
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setError("");
    element.src = src;
    element.load();
    if (!startedRef.current && src === initialSrc.current) {
      setIsLoading(false);
      const at = resumeRef.current;
      if (at > 0) {
        // Seeking needs the duration, so wait for metadata. The seek fires a
        // timeupdate, which moves the progress bar to the saved spot.
        element.addEventListener("loadedmetadata", () => {
          if (element.src.endsWith(src)) element.currentTime = Math.min(at, Math.max(0, element.duration - 1));
        }, { once: true });
      }
      return;
    }
    resumeRef.current = 0;
    startedRef.current = true;
    setIsLoading(true);
    element.play().catch(() => {
      setIsPlaying(false);
      setIsLoading(false);
      setError("Playback could not start. Press play to try again.");
    });
  }, [src]);

  const play = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;
    startedRef.current = true;
    setError("");
    element.play().catch(() => setError("Playback could not start. Check the audio source and try again."));
  }, []);

  const togglePlay = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;
    if (!element.paused) element.pause();
    else play();
  }, [play]);

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
      const replay = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => setError("Playback could not restart."));
      };
      if (repeat) replay();
      // `replay` lets the caller loop the same song (e.g. repeat-all on a one-song list).
      else { setIsPlaying(false); onEnded?.(replay); }
    },
    onError: () => { setIsPlaying(false); setIsLoading(false); setError("This track could not be loaded."); },
  };

  return { audioRef, isPlaying, isLoading, progress, duration, error, play, togglePlay, seek, restart, handlers, formatTime };
}
