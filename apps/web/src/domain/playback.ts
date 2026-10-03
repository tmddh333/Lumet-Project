export interface Playback {
  index: number;
  playing: boolean;
  last: number;
}
export type PlaybackAction =
  | { type: "next" | "previous" | "tick" | "toggle" | "pause" }
  | { type: "seek"; index: number };

export function createPlayback(length: number): Playback {
  return { index: 0, playing: false, last: Math.max(0, length - 1) };
}

export function playbackReducer(
  state: Playback,
  action: PlaybackAction,
): Playback {
  switch (action.type) {
    case "pause":
      return { ...state, playing: false };
    case "toggle":
      if (state.last === 0) return state;
      if (state.playing) return { ...state, playing: false };
      return {
        ...state,
        index: state.index === state.last ? 0 : state.index,
        playing: true,
      };
    case "previous":
      return { ...state, index: Math.max(0, state.index - 1), playing: false };
    case "next":
      return {
        ...state,
        index: Math.min(state.last, state.index + 1),
        playing: false,
      };
    case "seek":
      if (!Number.isFinite(action.index)) return state;
      return {
        ...state,
        index: Math.max(0, Math.min(state.last, Math.floor(action.index))),
        playing: false,
      };
    case "tick": {
      if (!state.playing) return state;
      const index = Math.min(state.last, state.index + 1);
      return { ...state, index, playing: index < state.last };
    }
  }
}
