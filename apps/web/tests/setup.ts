import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

let media: MediaQueryList;
export function setSystemDark(dark: boolean) {
  Object.defineProperty(media, "matches", { value: dark, configurable: true });
  const event = new Event("change");
  Object.defineProperty(event, "matches", { value: dark });
  media.dispatchEvent(event);
}
beforeEach(() => {
  if (typeof window === "undefined") return;
  const events = new EventTarget();
  media = Object.assign(events, {
    matches: false,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }) as MediaQueryList;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => media),
  );
  vi.stubGlobal("scrollTo", vi.fn());
  localStorage.clear();
  history.replaceState(null, "", "/");
  delete document.documentElement.dataset.theme;
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
