import type {
  Scenario,
  QuizScenario,
  PullRequestScenario,
} from "../domain/scenario";
import java from "./java-increment.json";
import javascript from "./javascript-reference.json";
import python from "./python-copy.json";
import javaCoupon from "./java-coupon-equality.json";
import javaList from "./java-member-list.json";
import jsPrices from "./javascript-price-sort.json";
import jsSearch from "./javascript-search-race.json";
import pythonTags from "./python-default-tags.json";
import pythonDraft from "./python-draft-copy.json";

// Only bundled, schema-validated fixtures enter here. The build validates all JSON
// before bundling. Future remote/user content needs validation at its own boundary.
export const scenarios = [
  java,
  javascript,
  python,
  javaCoupon,
  javaList,
  jsPrices,
  jsSearch,
  pythonTags,
  pythonDraft,
] as Scenario[];
export const quizScenarios = scenarios.filter(
  (scenario): scenario is QuizScenario => scenario.review.mode === "quiz",
);
export const prScenarios = scenarios.filter(
  (scenario): scenario is PullRequestScenario =>
    scenario.review.mode === "pull_request",
);
export const levelLabels = { foundation: "기초", practice: "실무" };
export const lessonHref = (scenario: Scenario) =>
  `#${scenario.review.mode === "pull_request" ? "review" : "trace"}/${scenario.scenarioId}`;

export interface Stack {
  id: string;
  name: string;
  symbol: string;
  status: "available" | "preview" | "planned";
  description: string;
  category: "language" | "framework" | "database";
}

export const stacks: Stack[] = [
  {
    id: "java",
    category: "language",
    name: "Java",
    symbol: "Ja",
    status: "available",
    description: "평가 순서 · 객체 동등성 · 컬렉션",
  },
  {
    id: "javascript",
    category: "language",
    name: "JavaScript",
    symbol: "JS",
    status: "available",
    description: "객체 참조 · 배열 · 비동기",
  },
  {
    id: "python",
    category: "language",
    name: "Python",
    symbol: "Py",
    status: "available",
    description: "리스트 · 기본 인자 · 중첩 객체",
  },
  {
    id: "typescript",
    category: "language",
    name: "TypeScript",
    symbol: "TS",
    status: "planned",
    description: "타입 좁히기 · 콘텐츠 준비 중",
  },
  {
    id: "kotlin",
    category: "language",
    name: "Kotlin",
    symbol: "Kt",
    status: "planned",
    description: "널 안전성 · 콘텐츠 준비 중",
  },
  {
    id: "go",
    category: "language",
    name: "Go",
    symbol: "Go",
    status: "planned",
    description: "슬라이스 · 콘텐츠 준비 중",
  },
  {
    id: "rust",
    category: "language",
    name: "Rust",
    symbol: "Rs",
    status: "planned",
    description: "소유권 · 콘텐츠 준비 중",
  },
  {
    id: "sql",
    category: "database",
    name: "SQL",
    symbol: "SQL",
    status: "planned",
    description: "쿼리 흐름 · 콘텐츠 준비 중",
  },
  {
    id: "react",
    name: "React",
    symbol: "Re",
    category: "framework",
    status: "planned",
    description: "상태·Effect · 콘텐츠 준비 중",
  },
  {
    id: "spring",
    name: "Spring",
    symbol: "Sp",
    category: "framework",
    status: "planned",
    description: "트랜잭션 · 콘텐츠 준비 중",
  },
];

export const findScenario = (id?: string) =>
  scenarios.find((scenario) => scenario.scenarioId === id);
export const stackName = (id: string) =>
  stacks.find((stack) => stack.id === id)?.name ?? id;
