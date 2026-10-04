import { act, renderHook } from "@testing-library/react";
import { createPlayback, playbackReducer } from "../src/domain/playback";
import { usePlayback } from "../src/hooks/usePlayback";

describe("playback state machine", () => {
  it("clamps previous, next and explicit seeks, including invalid input", () => {
    let state = createPlayback(4);
    state = playbackReducer(state, { type: "previous" });
    expect(state.index).toBe(0);
    for (let i = 0; i < 8; i++)
      state = playbackReducer(state, { type: "next" });
    expect(state).toEqual({ index: 3, last: 3, playing: false });
    expect(playbackReducer(state, { type: "seek", index: -30 }).index).toBe(0);
    expect(playbackReducer(state, { type: "seek", index: 30 }).index).toBe(3);
    expect(playbackReducer(state, { type: "seek", index: NaN })).toBe(state);
  });
  it("stops at the last step, ignores paused ticks and replays from the start", () => {
    let state = playbackReducer(createPlayback(3), { type: "toggle" });
    state = playbackReducer(state, { type: "tick" });
    expect(state.index).toBe(1);
    state = playbackReducer(state, { type: "tick" });
    expect(state).toEqual({ index: 2, last: 2, playing: false });
    expect(playbackReducer(state, { type: "tick" })).toBe(state);
    expect(playbackReducer(state, { type: "toggle" })).toEqual({
      index: 0,
      last: 2,
      playing: true,
    });
  });
  it.each([0, 1])("does not start a timer for %i steps", (length) => {
    expect(
      playbackReducer(createPlayback(length), { type: "toggle" }).playing,
    ).toBe(false);
  });
});

describe("playback timers", () => {
  it("plays, pauses, changes speed without duplicate timers and stops at completion", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePlayback(4));
    act(() => result.current.dispatch({ type: "toggle" }));
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(1600));
    expect(result.current.index).toBe(1);
    act(() => result.current.dispatch({ type: "pause" }));
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.index).toBe(1);
    act(() => {
      result.current.setSpeed(2);
      result.current.dispatch({ type: "toggle" });
    });
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(800));
    expect(result.current.index).toBe(2);
    act(() => result.current.setSpeed(0.5));
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(3200));
    expect(result.current.index).toBe(3);
    expect(result.current.playing).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("cleans up on unmount and when the browser tab is hidden", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => usePlayback(4));
    act(() => result.current.dispatch({ type: "toggle" }));
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(result.current.playing).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    act(() => result.current.dispatch({ type: "toggle" }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("manual navigation pauses playback", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePlayback(4));
    act(() => result.current.dispatch({ type: "toggle" }));
    act(() => result.current.dispatch({ type: "next" }));
    expect(result.current.index).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("pauses on URL navigation even before the component unmounts", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePlayback(4));
    act(() => result.current.dispatch({ type: "toggle" }));
    act(() => {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current.playing).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.index).toBe(0);
  });
});
