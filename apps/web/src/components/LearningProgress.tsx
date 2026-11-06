import { findScenario, lessonHref } from "../content/catalog";
import { useLearning } from "../hooks/useLearning";

export function LearningProgress() {
  const learning = useLearning();
  const last = findScenario(learning.progress.last?.id);
  const revisit = Object.entries(learning.progress.lessons)
    .filter(([, value]) => value.needsPractice)
    .map(([id]) => findScenario(id))
    .filter((scenario) => scenario !== undefined);
  return (
    <section className="learning-progress" aria-labelledby="progress-title">
      <div className="section-heading">
        <h2 id="progress-title">나의 학습</h2>
        <span className="quiet">가입 없이 이어가는 학습</span>
      </div>
      {last ? (
        <a
          className="lesson-row"
          href={`#${learning.progress.last!.page}/${last.scenarioId}`}
        >
          <span>
            <small>이어서 학습하기</small>
            <strong>{last.title}</strong>
          </span>
          <span aria-hidden="true">→</span>
        </a>
      ) : (
        <p className="quiet">시나리오를 시작하면 여기서 이어갈 수 있어요.</p>
      )}
      {revisit.length > 0 && (
        <div className="revisit-list">
          <h3>다시 살펴볼 개념</h3>
          {revisit.map((scenario) => (
            <a
              className="lesson-row"
              key={scenario.scenarioId}
              href={lessonHref(scenario)}
            >
              <span>
                <small>{scenario.topic}</small>
                <strong>{scenario.title}</strong>
              </span>
              <span aria-hidden="true">↻</span>
            </a>
          ))}
        </div>
      )}
      <label className="practice-choice">
        <input
          type="checkbox"
          checked={learning.enabled}
          onChange={(event) => learning.chooseSaving(event.target.checked)}
        />
        이 기기에 학습 진도 저장
      </label>
      <p className="quiet">
        동의하면 시나리오·단계·리뷰 완료·복습 표시만 저장합니다. 리뷰 내용은
        저장하지 않습니다. 해제하면 저장된 진도를 삭제합니다.
      </p>
      {!learning.enabled && (
        <p className="quiet">현재 진도는 새로고침 전까지만 유지됩니다.</p>
      )}
      {learning.storageError && (
        <p role="status">
          기기 저장 변경에 실패했습니다. 현재 진도는 사용할 수 있지만, 이전
          저장값은 브라우저 사이트 데이터에서 확인해 주세요.
        </p>
      )}
      {Object.keys(learning.progress.lessons).length > 0 && (
        <button className="reset-progress" onClick={learning.clearProgress}>
          학습 진도 초기화
        </button>
      )}
    </section>
  );
}
