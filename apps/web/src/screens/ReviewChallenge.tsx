import { useState, type FormEvent } from "react";
import type { Scenario } from "../domain/scenario";
import { CodeBlock } from "../components/CodeBlock";
import { ScenarioInfo } from "../components/ScenarioInfo";

export function ReviewChallenge({ scenario }: { scenario: Scenario }) {
  const [answer, setAnswer] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const correct = answer === scenario.review.answer;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (answer) setSubmitted(true);
  }

  return (
    <>
      <ScenarioInfo scenario={scenario} />
      <div className="review-layout">
        <section className="panel" aria-label="리뷰할 코드">
          <div className="panel-heading">
            <h2>먼저, 스스로 예측해 보세요</h2>
          </div>
          <CodeBlock
            code={scenario.code}
            language={scenario.language}
            line={null}
          />
          <p className="panel-copy">
            생각을 정리한 뒤 제출하면 정답과 근거를 볼 수 있어요.
          </p>
        </section>
        <form className="review-form" onSubmit={submit}>
          <fieldset>
            <legend>{scenario.review.question}</legend>
            <div className="answer-options">
              {scenario.review.options.map((option) => (
                <label
                  key={option.id}
                  className={`answer-option ${answer === option.id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option.id}
                    checked={answer === option.id}
                    onChange={() => {
                      setAnswer(option.id);
                      setSubmitted(false);
                    }}
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="reason-label" htmlFor="review-reason">
            그렇게 생각한 이유 <span className="quiet">선택 사항</span>
          </label>
          <textarea
            id="review-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="값이 바뀌는 순간을 내 말로 적어 보세요."
            rows={3}
            maxLength={2000}
          />
          <p className="quiet">작성한 이유는 저장하거나 전송하지 않습니다.</p>
          <button
            className="primary full-width"
            type="submit"
            disabled={!answer}
          >
            답 제출하고 해설 보기
          </button>
          {submitted && (
            <section className="review-feedback" role="status">
              <h2>
                {correct
                  ? "정확하게 이해했어요."
                  : "다시 살펴볼 지점이 있어요."}
              </h2>
              <p>
                <strong>
                  정답:{" "}
                  {
                    scenario.review.options.find(
                      (option) => option.id === scenario.review.answer,
                    )?.text
                  }
                </strong>
              </p>
              <p>{scenario.review.rationale}</p>
              <div className="feedback-actions">
                <a className="button" href={`#trace/${scenario.scenarioId}`}>
                  추적 다시 보기
                </a>
                <a className="button primary" href="#stacks">
                  다음 학습 찾기
                </a>
              </div>
            </section>
          )}
        </form>
      </div>
    </>
  );
}
