import type { Scenario } from "../domain/scenario";
import java from "./java-increment.json";
import javascript from "./javascript-reference.json";
import python from "./python-copy.json";

// Only bundled, schema-validated fixtures enter here. The build validates all JSON
// before bundling. Future remote/user content needs validation at its own boundary.
export const scenarios = [java, javascript, python] as Scenario[];

export interface Stack {
  id: string;
  name: string;
  symbol: string;
  status: "available" | "preview" | "planned";
  description: string;
}

export const stacks: Stack[] = [
  {
    id: "java",
    name: "Java",
    symbol: "Ja",
    status: "available",
    description: "증감 연산과 평가 순서",
  },
  {
    id: "javascript",
    name: "JavaScript",
    symbol: "JS",
    status: "available",
    description: "객체 참조와 const",
  },
  {
    id: "python",
    name: "Python",
    symbol: "Py",
    status: "available",
    description: "리스트와 얕은 복사",
  },
  {
    id: "typescript",
    name: "TypeScript",
    symbol: "TS",
    status: "planned",
    description: "타입 좁히기 · 콘텐츠 준비 중",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    symbol: "Kt",
    status: "planned",
    description: "널 안전성 · 콘텐츠 준비 중",
  },
  {
    id: "go",
    name: "Go",
    symbol: "Go",
    status: "planned",
    description: "슬라이스 · 콘텐츠 준비 중",
  },
  {
    id: "rust",
    name: "Rust",
    symbol: "Rs",
    status: "planned",
    description: "소유권 · 콘텐츠 준비 중",
  },
  {
    id: "sql",
    name: "SQL",
    symbol: "SQL",
    status: "planned",
    description: "쿼리 흐름 · 콘텐츠 준비 중",
  },
];

export const findScenario = (id?: string) =>
  scenarios.find((scenario) => scenario.scenarioId === id);
export const stackName = (id: string) =>
  stacks.find((stack) => stack.id === id)?.name ?? id;
