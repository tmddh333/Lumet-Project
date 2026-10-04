import brand from "../brand.json";
import { scenarios, stackName } from "../content/catalog";
import { Icon } from "../components/Icon";

export function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">READ. TRACE. UNDERSTAND.</p>
        <h1>
          코드를 읽는 순간,
          <br />
          <span>이해가 시작됩니다.</span>
        </h1>
        <p className="hero-copy">
          한 줄씩 흐름을 따라가고,
          <br />
          직접 예측하고, 나의 언어로 이해해 보세요.
        </p>
        <a className="button primary" href="#stacks">
          내 기술로 시작하기 <Icon name="arrow" />
        </a>
        <p className="quiet">가입 없이, 해설까지 모두 무료</p>
        <div className="hero-diagram" aria-hidden="true">
          <code>code</code>
          <span>→</span>
          <code>state</code>
          <span>→</span>
          <code>insight</code>
        </div>
      </section>
      <section aria-labelledby="lessons-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">작은 코드, 새로운 발견</p>
            <h2 id="lessons-title">오늘의 실습</h2>
          </div>
          <span className="quiet">3개의 무료 시나리오</span>
        </div>
        <div className="lesson-grid">
          {scenarios.map((scenario, index) => (
            <a
              className="lesson-card"
              href={`#trace/${scenario.scenarioId}`}
              key={scenario.scenarioId}
            >
              <div className="lesson-meta">
                <span className={`language-mark ${scenario.language}`}>
                  {["Ja", "JS", "Py"][index]}
                </span>
                <span>{stackName(scenario.language)}</span>
                <span className="lesson-index">0{index + 1}</span>
              </div>
              <h3>{scenario.title}</h3>
              <p>{scenario.summary}</p>
              <div className="lesson-bottom">
                <span>코드 읽기 · 추적 · 리뷰</span>
                <Icon name="arrow" />
              </div>
            </a>
          ))}
        </div>
      </section>
      <section className="learning-note">
        <span className="note-symbol" aria-hidden="true">
          ✧
        </span>
        <div>
          <h2>정답보다, 이해하는 과정.</h2>
          <p>
            검증된 학습 시나리오로 상태 변화를 살펴봅니다. 직접 코드를
            실행하거나 AI가 결과를 추정하지 않습니다.
          </p>
        </div>
      </section>
      <p className="brand-note">
        {brand.tagline} · {brand.name}은 {brand.notice}입니다.
      </p>
    </>
  );
}
