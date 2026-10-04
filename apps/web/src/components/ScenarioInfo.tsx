import { executionLabels, type Scenario } from "../domain/scenario";
import { stackName } from "../content/catalog";

export function ScenarioInfo({ scenario }: { scenario: Scenario }) {
  return (
    <>
      <p className="eyebrow">
        {stackName(scenario.language)} · {scenario.languageVersion}
      </p>
      <h1>{scenario.title}</h1>
      <p className="provenance">
        <span aria-hidden="true">◇</span>{" "}
        {executionLabels[scenario.executionKind]}
      </p>
      <details className="assumptions">
        <summary>버전·가정·검증 근거</summary>
        <ul>
          {scenario.preconditions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          저장소의 언어별 런타임 테스트로 샘플의 각 상태를 대조합니다.
          화면에서는 미리 작성한 단계를 재생합니다.
        </p>
        <p>
          공식 문서{" "}
          {scenario.verification.sources.map((url, index) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              근거 {index + 1}
              <span className="sr-only"> (새 탭)</span>
            </a>
          ))}
        </p>
      </details>
    </>
  );
}
