/** Version 1: display values retain the producer's language-specific semantics. */
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

export interface Scenario {
  schemaVersion: 1;
  scenarioId: string;
  title: string;
  summary: string;
  language: string;
  languageVersion: string;
  topic: string;
  executionKind: "curated_simulation" | "recorded_runtime_trace";
  preconditions: string[];
  code: string;
  visualization: Visualization;
  steps: TraceStep[];
  review: {
    question: string;
    options: { id: string; text: string }[];
    answer: string;
    rationale: string;
  };
  verification: {
    method: "runtime_test";
    reference: string;
    sources: string[];
  };
  /** Interpretation is never part of the execution state or provenance label. */
  aiInterpretation?: { kind: "ai_interpretation"; text: string };
}

export const executionLabels: Record<Scenario["executionKind"], string> = {
  curated_simulation: "검증된 학습 시나리오 · 실제 코드 실행 아님",
  recorded_runtime_trace: "기록된 런타임 추적 · 현재 실행 아님",
};
