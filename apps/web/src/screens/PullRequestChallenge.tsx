import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PullRequestScenario } from "../domain/scenario";
import {
  canSubmitReview,
  compareReview,
  emptyReview,
  reviewCategories,
  type ReviewDraft,
} from "../domain/review";
import { ScenarioInfo } from "../components/ScenarioInfo";
import { ReviewDiff } from "../components/ReviewDiff";
import { CodeBlock } from "../components/CodeBlock";
import { useLearning } from "../hooks/useLearning";

export function PullRequestChallenge({
  scenario,
}: {
  scenario: PullRequestScenario;
}) {
  const { attempts, submitReview, recordReview, progress, visit } =
    useLearning();
  const [draft, setDraft] = useState<ReviewDraft>(
    () => attempts[scenario.scenarioId] ?? { ...emptyReview },
  );
  const [submitted, setSubmitted] = useState(
    () => !!attempts[scenario.scenarioId],
  );
  const [hintCount, setHintCount] = useState(0);
  const [showFix, setShowFix] = useState(false);
  const feedbackHeading = useRef<HTMLHeadingElement>(null);
  const review = scenario.review;
  const comparison = compareReview(draft, review);
  useEffect(
    () => visit(scenario.scenarioId, "review"),
    [scenario.scenarioId, visit],
  );
  useEffect(() => {
    if (submitted) feedbackHeading.current?.focus();
  }, [submitted]);
  function change(next: Partial<ReviewDraft>) {
    setDraft((previous) => ({ ...previous, ...next }));
    setSubmitted(false);
    setShowFix(false);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmitReview(draft, scenario.code.split("\n").length)) return;
    submitReview(
      scenario.scenarioId,
      draft,
      !comparison.lineMatches || !comparison.categoryMatches,
    );
    setSubmitted(true);
  }
  return (
    <>
      <ScenarioInfo scenario={scenario} hideReferences={!submitted} />
      <section className="pr-brief">
        <p className="eyebrow">학습용 PR · 변경 요청</p>
        <p>{review.context}</p>
        <h2>지켜야 할 동작</h2>
        <ul>
          {review.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <div className="review-layout pr-layout">
        <section className="panel" aria-label="변경 사항">
          <div className="panel-heading">
            <h2>{review.filePath}</h2>
            <span className="quiet">− 삭제 / + 추가</span>
          </div>
          <ReviewDiff
            before={review.beforeCode}
            after={scenario.code}
            selectedLine={draft.line}
            onSelect={(line) => change({ line })}
          />
          <p className="panel-copy">
            의견을 남길 새 코드의 줄을 선택하세요. 삭제된 줄은 비교용입니다.
          </p>
        </section>
        <form className="review-form" onSubmit={submit}>
          <h2>내 리뷰 작성</h2>
          <p className="quiet">발생 조건과 영향을 먼저 정리해 보세요.</p>
          <label className="reason-label" htmlFor="review-line">
            리뷰할 줄
          </label>
          <select
            id="review-line"
            value={draft.line ?? ""}
            onChange={(event) =>
              change({
                line: event.target.value ? Number(event.target.value) : null,
              })
            }
            required
          >
            <option value="">줄을 선택하세요</option>
            {scenario.code.split("\n").map((_line, index) => (
              <option value={index + 1} key={index}>
                {index + 1}행
              </option>
            ))}
          </select>
          <label className="reason-label" htmlFor="review-category">
            문제 유형
          </label>
          <select
            id="review-category"
            value={draft.category}
            onChange={(event) =>
              change({
                category: event.target.value as ReviewDraft["category"],
              })
            }
            required
          >
            <option value="">유형을 선택하세요</option>
            {reviewCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <label className="reason-label" htmlFor="review-condition">
            언제 발생하나요?
          </label>
          <textarea
            id="review-condition"
            rows={2}
            maxLength={1000}
            required
            placeholder="입력값, 호출 순서 등 발생 조건"
            value={draft.condition}
            onChange={(event) => change({ condition: event.target.value })}
          />
          <label className="reason-label" htmlFor="review-impact">
            어떤 영향을 주나요?
          </label>
          <textarea
            id="review-impact"
            rows={2}
            maxLength={1000}
            required
            placeholder="요구사항과 달라지는 동작"
            value={draft.impact}
            onChange={(event) => change({ impact: event.target.value })}
          />
          <label className="reason-label" htmlFor="review-test">
            어떻게 확인할까요? <span className="quiet">선택 사항</span>
          </label>
          <textarea
            id="review-test"
            rows={2}
            maxLength={1000}
            placeholder="재현 방법 또는 테스트 아이디어"
            value={draft.testIdea}
            onChange={(event) => change({ testIdea: event.target.value })}
          />
          <p className="quiet">
            작성한 리뷰는 이 방문 동안만 유지되며 저장·전송하지 않습니다.
          </p>
          {!submitted && (
            <aside className="review-hints">
              <button
                type="button"
                disabled={hintCount >= review.hints.length}
                onClick={() => setHintCount((count) => count + 1)}
              >
                생각할 거리 힌트 {Math.min(hintCount + 1, review.hints.length)}{" "}
                / {review.hints.length}
              </button>
              {hintCount > 0 && (
                <ul aria-live="polite">
                  {review.hints.slice(0, hintCount).map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              )}
            </aside>
          )}
          <button
            className="primary full-width"
            type="submit"
            disabled={!canSubmitReview(draft, scenario.code.split("\n").length)}
          >
            리뷰 제출하고 근거 비교
          </button>
        </form>
      </div>
      {submitted && (
        <section
          className="review-feedback pr-feedback"
          aria-labelledby="feedback-title"
        >
          <h2 id="feedback-title" tabIndex={-1} ref={feedbackHeading}>
            검증된 관점과 내 리뷰 비교
          </h2>
          <p role="status">
            {comparison.lineMatches && comparison.categoryMatches
              ? "선택한 위치와 문제 유형이 이 시나리오의 핵심 관점과 일치합니다."
              : "선택한 위치·유형과 검증된 관점에 차이가 있습니다. 아래 재현 근거를 비교해 보세요."}
          </p>
          <p className="quiet">
            작성한 문장의 정확성은 자동 채점하지 않습니다. 다른 타당한 문제나
            해결 방법도 있을 수 있습니다.
          </p>
          <div className="review-comparison">
            <div>
              <h3>내가 남긴 의견</h3>
              <p>
                <strong>
                  {draft.line}행 ·{" "}
                  {
                    reviewCategories.find((item) => item.id === draft.category)
                      ?.label
                  }
                </strong>
              </p>
              <p>{draft.condition}</p>
              <p>{draft.impact}</p>
              {draft.testIdea && <p>{draft.testIdea}</p>}
            </div>
            <div>
              <h3>검증된 재현 근거</h3>
              <p>
                <strong>검토 위치: {review.finding.lines.join(", ")}행</strong>
              </p>
              <p>{review.finding.rationale}</p>
              <dl>
                <dt>발생 조건</dt>
                <dd>{review.finding.condition}</dd>
                <dt>영향</dt>
                <dd>{review.finding.impact}</dd>
                <dt>확인할 테스트</dt>
                <dd>{review.finding.test}</dd>
              </dl>
            </div>
          </div>
          <div className="feedback-actions">
            <a
              className="button primary"
              href={`#trace/${scenario.scenarioId}`}
            >
              상태 변화로 검증하기
            </a>
            <button
              type="button"
              aria-expanded={showFix}
              onClick={() => setShowFix((shown) => !shown)}
            >
              {showFix ? "수정 예시 접기" : "수정 예시 펼치기"}
            </button>
          </div>
          {showFix && (
            <div className="fix-example">
              <h3>가능한 수정 방법 하나</h3>
              <CodeBlock
                code={review.fix.code}
                language={scenario.language}
                line={null}
              />
              <p>{review.fix.explanation}</p>
            </div>
          )}
          <label className="practice-choice">
            <input
              type="checkbox"
              checked={
                progress.lessons[scenario.scenarioId]?.needsPractice ?? false
              }
              onChange={(event) =>
                recordReview(scenario.scenarioId, event.target.checked)
              }
            />
            이 개념을 다시 복습하기
          </label>
        </section>
      )}
    </>
  );
}
