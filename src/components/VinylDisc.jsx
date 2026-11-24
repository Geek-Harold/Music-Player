import { useEffect, useRef } from "react";
import "./VinylDisc.css";
import { reducedMotion } from "../motion";

// Like a turntable, the record doesn't start or stop dead: it spins up when you
// press play and coasts to a halt on pause. Each ramp is a constant acceleration
// (quadratic easing) whose end speed matches the steady spin, so the hand-off is seamless.
const REVOLUTION = 6000; // ms per turn at full speed
const RAMP = 900; // ms to reach full speed, or to stop
const RAMP_TURN = (360 / REVOLUTION) * RAMP / 2; // degrees covered while ramping
const EASE_IN_QUAD = "cubic-bezier(.11,0,.5,0)";
const EASE_OUT_QUAD = "cubic-bezier(.5,1,.89,1)";

const angleOf = (element) => {
  const { a, b } = new DOMMatrix(getComputedStyle(element).transform);
  return Math.atan2(b, a) * 180 / Math.PI;
};
const turn = (from, by) => [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${from + by}deg)` }];

export default function VinylDisc({ track, isPlaying }) {
  const discRef = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const disc = discRef.current;
    if (!disc || reducedMotion()) return;
    // A record that mounts paused just sits still; one that mounts playing spins up.
    if (!isPlaying && !started.current) return;
    started.current = true;
    const from = angleOf(disc);
    disc.getAnimations().forEach((animation) => animation.cancel());
    if (!isPlaying) {
      disc.animate(turn(from, RAMP_TURN), { duration: RAMP, easing: EASE_OUT_QUAD, fill: "forwards" });
      return;
    }
    const spinUp = disc.animate(turn(from, RAMP_TURN), { duration: RAMP, easing: EASE_IN_QUAD, fill: "forwards" });
    spinUp.finished.then(() => { disc.animate(turn(from + RAMP_TURN, 360), { duration: REVOLUTION, iterations: Infinity }); spinUp.cancel(); }, () => {});
  }, [isPlaying]);
  return <div ref={discRef} className="vinyl" aria-label={`Vinyl record for ${track.title}`}><div className="vinyl-label"><div className="waveform" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} style={{ height: `${18 + ((index * 7) % 5) * 12}%` }} />)}</div></div></div>;
}
