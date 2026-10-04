// @vitest-environment node
import { scenarios, stacks } from "../src/content/catalog";
import { executionLabels } from "../src/domain/scenario";
import {
  validateScenario,
  loadFixtures,
} from "../scripts/validate-fixtures.mjs";

describe("versioned language-independent content", () => {
  it("validates every bundled JSON fixture and keeps languages isolated", () => {
    expect(loadFixtures()).toHaveLength(scenarios.length);
    expect(new Set(scenarios.map((scenario) => scenario.language)).size).toBe(
      3,
    );
    for (const scenario of scenarios) {
      expect(validateScenario(scenario)).toBe(scenario);
      expect(scenario.executionKind).toBe("curated_simulation");
      expect(scenario.verification.reference).toContain(scenario.scenarioId);
      expect(
        stacks.find((stack) => stack.id === scenario.language)?.status,
      ).toBe("available");
    }
    expect(
      scenarios.find((item) => item.language === "java")?.steps.at(-1)?.state,
    ).toEqual({ a: "12", b: "10", c: "12" });
    expect(
      scenarios.find((item) => item.language === "javascript")?.code,
    ).toContain("const alias = original;");
    expect(
      scenarios.find((item) => item.language === "python")?.code,
    ).toContain("original[:]");
  });
  it.each([
    [
      "scenario version",
      (s: Record<string, unknown>) => {
        s.schemaVersion = 2;
      },
    ],
    [
      "unknown renderer",
      (s: Record<string, unknown>) => {
        s.visualization = { type: "made-up", schemaVersion: 1 };
      },
    ],
    [
      "fabricated provenance",
      (s: Record<string, unknown>) => {
        s.executionKind = "ai_interpretation";
      },
    ],
  ])("rejects %s", (_name, mutate) => {
    const fixture = structuredClone(scenarios[0]) as unknown as Record<
      string,
      unknown
    >;
    mutate(fixture);
    expect(() => validateScenario(fixture)).toThrow();
  });
  it("rejects out-of-range highlights and answers missing from the options", () => {
    const fixture = structuredClone(scenarios[0]!);
    fixture.steps[1]!.line = 100;
    expect(() => validateScenario(fixture)).toThrow("outside the code");
    fixture.steps[1]!.line = 1;
    fixture.review.answer = "missing";
    expect(() => validateScenario(fixture)).toThrow("Invalid review");
  });
  it("does not label recorded data as a curated simulation", () => {
    expect(executionLabels.recorded_runtime_trace).toContain("기록된 런타임");
    expect(executionLabels.curated_simulation).toContain("실제 코드 실행 아님");
  });
});
