import type { Scenario } from "../domain/scenario";
import { usePlayback } from "../hooks/usePlayback";
import { CodeBlock } from "../components/CodeBlock";
import { ScenarioInfo } from "../components/ScenarioInfo";
import { Visualization } from "../components/Visualization";
import { Icon } from "../components/Icon";

export function TracePlayer({ scenario }: { scenario: Scenario }) {
  const player = usePlayback(scenario.steps.length);
  const step = scenario.steps[player.index];
  if (!step) return <p role="alert">시나리오 단계를 읽을 수 없습니다.</p>;
  const completed = player.index === player.last;
  return (
    <>
      <ScenarioInfo scenario={scenario} />
      <div className="trace-layout">
        <section className="panel" aria-labelledby="code-title">
          <div className="panel-heading">
            <h2 id="code-title">코드 읽기</h2>
            <span className="quiet">{scenario.topic}</span>
          </div>
          <CodeBlock
            code={scenario.code}
            line={step.line}
            language={scenario.language}
          />
          <div className="player-controls">
            <div className="step-heading">
              <span data-testid="step-label">
                {player.index} / {player.last} 단계
              </span>
              <span className={completed ? "available" : "quiet"}>
                {completed
                  ? "추적 완료"
                  : player.playing
                    ? "재생 중"
                    : "일시정지"}
              </span>
            </div>
            <label className="sr-only" htmlFor="step-range">
              단계 선택
            </label>
            <input
              id="step-range"
              className="step-range"
              type="range"
              min={0}
              max={player.last}
              value={player.index}
              aria-valuetext={`${player.index} / ${player.last} 단계`}
              onChange={(event) =>
                player.dispatch({
                  type: "seek",
                  index: Number(event.target.value),
                })
              }
            />
            <div className="transport">
              <button
                disabled={player.index === 0}
                onClick={() => player.dispatch({ type: "previous" })}
              >
                ← 이전
              </button>
              <button
                className="primary"
                onClick={() => player.dispatch({ type: "toggle" })}
              >
                {player.playing
                  ? "Ⅱ 일시정지"
                  : completed
                    ? "↻ 다시 재생"
                    : "▶ 자동 재생"}
              </button>
              <button
                disabled={completed}
                onClick={() => player.dispatch({ type: "next" })}
              >
                다음 →
              </button>
            </div>
            <label className="speed-control">
              재생 속도
              <select
                value={player.speed}
                onChange={(event) =>
                  player.setSpeed(Number(event.target.value))
                }
              >
                <option value={0.5}>0.5× · 천천히</option>
                <option value={1}>1× · 보통</option>
                <option value={2}>2× · 빠르게</option>
              </select>
            </label>
          </div>
        </section>
        <div className="state-column">
          <section className="panel" aria-labelledby="state-title">
            <div className="panel-heading">
              <h2 id="state-title">현재 상태</h2>
              <span className="quiet">문장 완료 후</span>
            </div>
            <Visualization
              spec={scenario.visualization}
              step={step}
              previous={scenario.steps[player.index - 1]}
            />
          </section>
          <section className="explanation" aria-labelledby="explanation-title">
            <p className="eyebrow" id="explanation-title">
              STEP {String(player.index).padStart(2, "0")} · 왜 이렇게 될까요?
            </p>
            <p role="status" aria-live="polite">
              {step.explanation}
            </p>
          </section>
        </div>
      </div>
      {scenario.aiInterpretation && (
        <aside className="panel">
          <h2>AI 해석 · 실행 사실과 별개</h2>
          <p>{scenario.aiInterpretation.text}</p>
        </aside>
      )}
      <div className="next-action">
        <p>
          {completed
            ? "흐름을 살펴봤어요. 이제 내 생각을 확인해 볼까요?"
            : "코드를 먼저 읽고 결과를 예측해도 좋아요."}
        </p>
        <a className="button primary" href={`#review/${scenario.scenarioId}`}>
          리뷰로 이해 확인 <Icon name="arrow" />
        </a>
      </div>
    </>
  );
}
