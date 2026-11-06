import { findScenario, scenarios } from "../content/catalog";
export const progressKey = "lumet.progress.v1";
export const consentKey = "lumet.progress-consent";
export interface LessonProgress {
  step: number;
  reviewed: boolean;
  needsPractice: boolean;
}
export interface Progress {
  lessons: Record<string, LessonProgress>;
  last?: { id: string; page: "trace" | "review" };
}
export const emptyProgress = (): Progress => ({ lessons: {} });

/** Allowlist only coarse progress; review text/source never passes this boundary. */
export function parseProgress(raw: string | null): Progress {
  try {
    const data: unknown = JSON.parse(raw ?? "null");
    if (
      !data ||
      typeof data !== "object" ||
      !("lessons" in data) ||
      !data.lessons ||
      typeof data.lessons !== "object"
    )
      return emptyProgress();
    const progress = emptyProgress();
    for (const scenario of scenarios) {
      const entry: unknown = (data.lessons as Record<string, unknown>)[
        scenario.scenarioId
      ];
      if (
        !entry ||
        typeof entry !== "object" ||
        !("step" in entry) ||
        !Number.isInteger(entry.step) ||
        !("reviewed" in entry) ||
        typeof entry.reviewed !== "boolean" ||
        !("needsPractice" in entry) ||
        typeof entry.needsPractice !== "boolean"
      )
        continue;
      progress.lessons[scenario.scenarioId] = {
        step: Math.max(
          0,
          Math.min(scenario.steps.length - 1, entry.step as number),
        ),
        reviewed: entry.reviewed,
        needsPractice: entry.needsPractice,
      };
    }
    if (
      "last" in data &&
      data.last &&
      typeof data.last === "object" &&
      "id" in data.last &&
      typeof data.last.id === "string" &&
      findScenario(data.last.id) &&
      "page" in data.last &&
      (data.last.page === "trace" || data.last.page === "review")
    )
      progress.last = { id: data.last.id, page: data.last.page };
    return progress;
  } catch {
    return emptyProgress();
  }
}
