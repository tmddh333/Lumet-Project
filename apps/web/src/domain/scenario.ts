/** Version 2: reviewer-authored reasoning stays outside execution data. */
export interface TraceStep {
  id: number;
  line: number | null;
  state: Record<string, string>;
  explanation: string;
}

export interface Visualization {
  type: "variables";
  schemaVersion: 1;
  fields: { name: string; type: string }[];
}

export interface QuizReview {
  mode: "quiz";
  question: string;
  options: { id: string; text: string }[];
  answer: string;
  rationale: string;
}

export type ReviewCategory =
  "logic" | "state" | "async" | "exception" | "performance" | "other";
export interface PullRequestReview {
  mode: "pull_request";
  filePath: string;
  context: string;
  requirements: string[];
  beforeCode: string;
  hints: string[];
  finding: {
    lines: number[];
    category: ReviewCategory;
    rationale: string;
    condition: string;
    impact: string;
    test: string;
  };
  fix: { code: string; explanation: string };
}

export interface Scenario {
  schemaVersion: 2;
  scenarioId: string;
  title: string;
  summary: string;
  language: string;
  languageVersion: string;
  topic: string;
  level: "foundation" | "practice";
  executionKind: "curated_simulation" | "recorded_runtime_trace";
  preconditions: string[];
  code: string;
  visualization: Visualization;
  steps: TraceStep[];
  review: QuizReview | PullRequestReview;
  verification: {
    method: "runtime_test";
    reference: string;
    sources: string[];
  };
  /** Interpretation is never part of the execution state or provenance label. */
  aiInterpretation?: { kind: "ai_interpretation"; text: string };
}

export type QuizScenario = Scenario & { review: QuizReview };
export type PullRequestScenario = Scenario & { review: PullRequestReview };

export const executionLabels: Record<Scenario["executionKind"], string> = {
  curated_simulation: "검증된 학습 시나리오 · 실제 코드 실행 아님",
  recorded_runtime_trace: "기록된 런타임 추적 · 현재 실행 아님",
};
