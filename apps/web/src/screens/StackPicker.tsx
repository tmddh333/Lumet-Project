import { useState } from "react";
import { scenarios, stacks, stackName } from "../content/catalog";
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

export function StackPicker({
  selected,
  onSelection,
  interests,
  onInterest,
  storageFailed,
}: Props) {
  const [query, setQuery] = useState("");
  const visible = stacks.filter((stack) =>
    `${stack.name} ${stack.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const lessons = scenarios.filter((scenario) =>
    selected.includes(scenario.language),
  );
  return (
    <>
      <p className="eyebrow">나의 학습 경로</p>
      <h1>어떤 기술이 궁금한가요?</h1>
      <p className="intro">
        익숙한 기술도, 처음 만나는 기술도 좋아요.
        <br />
        관심 있는 기술을 여러 개 선택해 보세요.
      </p>
      <label className="search-box">
        <Icon name="search" />
        <span className="sr-only">기술 검색</span>
        <input
          type="search"
          placeholder="기술 또는 주제 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <fieldset className="stack-fieldset">
        <legend>
          기술 선택 <span className="quiet">복수 선택 가능</span>
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
        {lessons.map((scenario) => (
          <a
            className="lesson-row"
            href={`#trace/${scenario.scenarioId}`}
            key={scenario.scenarioId}
          >
            <span>
              <small>
                {stackName(scenario.language)} · {scenario.languageVersion}
              </small>
              <strong>{scenario.title}</strong>
            </span>
            <Icon name="arrow" />
          </a>
        ))}
      </section>
    </>
  );
}
