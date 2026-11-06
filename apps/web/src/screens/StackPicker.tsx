import { useState } from "react";
import {
  scenarios,
  stacks,
  stackName,
  lessonHref,
  levelLabels,
} from "../content/catalog";
import { Icon } from "../components/Icon";

interface Props {
  selected: string[];
  onSelection: (id: string) => void;
  interests: string[];
  onInterest: (id: string) => void;
  storageFailed: boolean;
}
const statusLabels = {
  available: "학습 가능",
  preview: "미리보기",
  planned: "준비 중",
};
const categories = [
  { id: "all", name: "전체" },
  { id: "language", name: "언어" },
  { id: "framework", name: "프레임워크" },
  { id: "database", name: "데이터베이스" },
];

export function StackPicker({
  selected,
  onSelection,
  interests,
  onInterest,
  storageFailed,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [topic, setTopic] = useState("all");
  const [level, setLevel] = useState("all");
  const search = query.trim().toLowerCase();
  const visible = stacks.filter(
    (stack) =>
      (category === "all" || stack.category === category) &&
      `${stack.name} ${stack.description} ${scenarios
        .filter((item) => item.language === stack.id)
        .map((item) => `${item.title} ${item.topic}`)
        .join(" ")}`
        .toLowerCase()
        .includes(search),
  );
  const selectedLessons = scenarios.filter((scenario) =>
    selected.includes(scenario.language),
  );
  const topics = [...new Set(selectedLessons.map((item) => item.topic))];
  const lessons = selectedLessons.filter(
    (scenario) =>
      (topic === "all" || scenario.topic === topic) &&
      (level === "all" || scenario.level === level) &&
      `${stackName(scenario.language)} ${scenario.title} ${scenario.topic}`
        .toLowerCase()
        .includes(search),
  );
  return (
    <>
      <p className="eyebrow">기술 → 주제 → 상황</p>
      <h1>어떤 기술이 궁금한가요?</h1>
      <p className="intro">
        관심 기술을 고르고, 기초부터 실무 상황까지 좁혀 보세요.
        <br />
        여러 기술을 함께 선택할 수 있어요.
      </p>
      <label className="search-box">
        <Icon name="search" />
        <span className="sr-only">기술 검색</span>
        <input
          type="search"
          placeholder="기술·주제·상황 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="category-filters" role="group" aria-label="기술 분류">
        {categories.map((item) => (
          <button
            key={item.id}
            aria-pressed={category === item.id}
            onClick={() => setCategory(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <fieldset className="stack-fieldset">
        <legend>
          기술 선택{" "}
          <span className="quiet">
            {selected.length}개 선택 · 복수 선택 가능
          </span>
        </legend>
        <div className="stack-grid">
          {visible.map((stack) => (
            <div
              key={stack.id}
              className={`stack-card ${selected.includes(stack.id) ? "selected" : ""}`}
            >
              <label className="stack-choice">
                <span className={`language-mark ${stack.id}`}>
                  {stack.symbol}
                </span>
                <span className="stack-description">
                  <strong>{stack.name}</strong>
                  <span>{stack.description}</span>
                </span>
                <input
                  type="checkbox"
                  checked={selected.includes(stack.id)}
                  onChange={() => onSelection(stack.id)}
                  aria-label={`${stack.name} 선택`}
                />
              </label>
              <div className="stack-status">
                <span
                  className={
                    stack.status === "available" ? "available" : "quiet"
                  }
                >
                  {statusLabels[stack.status]}
                  {stack.status === "available" &&
                    ` · ${scenarios.filter((scenario) => scenario.language === stack.id).length}개 시나리오`}
                </span>
                {stack.status !== "available" && (
                  <button
                    className="interest-button"
                    aria-pressed={interests.includes(stack.id)}
                    aria-label={`${stack.name} 관심 ${interests.includes(stack.id) ? "해제" : "등록"}`}
                    onClick={() => onInterest(stack.id)}
                  >
                    {interests.includes(stack.id)
                      ? "✓ 관심 등록됨"
                      : "+ 관심 등록"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      {visible.length === 0 && (
        <p role="status" className="empty-state">
          검색 결과가 없습니다. 다른 기술 이름으로 찾아보세요.
        </p>
      )}
      <p className="quiet" role="status">
        {storageFailed
          ? "이 기기에서 저장할 수 없어 관심 선택은 현재 방문 동안만 유지됩니다."
          : "관심 등록은 이 기기에만 저장됩니다. 서버로 전송되지 않습니다."}
      </p>
      <section className="selected-lessons" aria-labelledby="selected-title">
        <h2 id="selected-title">선택한 기술로 시작하기</h2>
        {selected.length === 0 && (
          <p className="quiet">
            위에서 기술을 선택하면 학습할 시나리오가 표시됩니다.
          </p>
        )}
        {selected
          .filter(
            (id) => !scenarios.some((scenario) => scenario.language === id),
          )
          .map((id) => (
            <p key={id} className="unavailable">
              {stackName(id)} 학습 시나리오는 준비 중입니다. 관심 등록을 하거나
              학습 가능한 기술을 직접 선택해 주세요.
            </p>
          ))}
        {selectedLessons.length > 0 && (
          <>
            <div className="lesson-filters">
              <div>
                <label htmlFor="lesson-topic">주제</label>
                <select
                  id="lesson-topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                >
                  <option value="all">모든 주제</option>
                  {topics.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lesson-level">난이도</label>
                <select
                  id="lesson-level"
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                >
                  <option value="all">모든 난이도</option>
                  <option value="foundation">기초 · 결과 예측</option>
                  <option value="practice">실무 · PR 리뷰</option>
                </select>
              </div>
            </div>
            <p className="quiet" role="status">
              조건에 맞는 시나리오 {lessons.length}개
            </p>
            {lessons.length === 0 && (
              <button
                onClick={() => {
                  setTopic("all");
                  setLevel("all");
                  setQuery("");
                }}
              >
                학습 필터 초기화
              </button>
            )}
          </>
        )}
        {lessons.map((scenario) => (
          <a
            className="lesson-row"
            href={lessonHref(scenario)}
            key={scenario.scenarioId}
          >
            <span>
              <small>
                {stackName(scenario.language)} · {scenario.languageVersion} ·{" "}
                {levelLabels[scenario.level]}
              </small>
              <strong>{scenario.title}</strong>
              <span className="lesson-topic">
                {scenario.topic} ·{" "}
                {scenario.review.mode === "pull_request"
                  ? "의견 먼저 작성"
                  : "코드 흐름부터"}
              </span>
            </span>
            <Icon name="arrow" />
          </a>
        ))}
      </section>
    </>
  );
}
