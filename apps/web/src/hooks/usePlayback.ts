import { useEffect, useReducer, useState } from "react";
import { createPlayback, playbackReducer } from "../domain/playback";

// The player is keyed by scenarioId. Leaving its route unmounts it.
export function usePlayback(length: number, initialIndex = 0) {
  const [state, dispatch] = useReducer(
    playbackReducer,
    { length, initialIndex },
    (initial) =>
      playbackReducer(createPlayback(initial.length), {
        type: "seek",
        index: initial.initialIndex,
      }),
  );
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!state.playing) return;
    const timer = window.setInterval(
      () => dispatch({ type: "tick" }),
      1600 / speed,
    );
    return () => window.clearInterval(timer);
  }, [state.playing, speed]);

  useEffect(() => {
    // A quick back/forward navigation can be batched before React unmounts.
    const pauseOnNavigation = () => dispatch({ type: "pause" });
    const pauseWhenHidden = () => {
      if (document.hidden) dispatch({ type: "pause" });
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    window.addEventListener("hashchange", pauseOnNavigation);
    return () => {
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      window.removeEventListener("hashchange", pauseOnNavigation);
    };
  }, []);

  return { ...state, dispatch, speed, setSpeed };
}
