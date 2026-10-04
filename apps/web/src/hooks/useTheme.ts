import { useEffect, useState } from "react";
import { readPreference, savePreference } from "../lib/storage";

type Theme = "dark" | "light";
type Preference = Theme | "system";
const query = "(prefers-color-scheme: dark)";

export function useTheme() {
  const [preference, setPreference] = useState<Preference>(() => {
    const stored = readPreference("lumet.theme");
    return stored === "dark" || stored === "light" ? stored : "system";
  });
  const [systemDark, setSystemDark] = useState(() => matchMedia(query).matches);
  const [storageFailed, setStorageFailed] = useState(false);
  const theme: Theme =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;

  useEffect(() => {
    const media = matchMedia(query);
    const update = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0b1120" : "#f7f9fd");
  }, [theme]);

  function choose(next: Preference) {
    setPreference(next);
    setStorageFailed(!savePreference("lumet.theme", next));
  }

  return { theme, preference, storageFailed, choose };
}
