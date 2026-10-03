# Codex 첫 작업 프롬프트 — M1 / Issue 1

다음 내용을 Codex에 붙여넣고, `lumet-project` 저장소 루트에서 작업하도록 지정한다.

---

당신은 LUMET 프로젝트의 구현 담당 개발자다. 작업 시작 전에 `AGENTS.md`, `docs/product/PRD-v0.2.md`, `docs/architecture/ARCHITECTURE.md`, `docs/design/DESIGN.md`, `docs/adr/0001-curated-traces-first.md`를 읽어라.

## 목표

현재 `prototype/`의 인터랙티브 시안을 React + TypeScript + Vite 기반 모바일 우선 PWA로 이관한다. 홈/기술 탐색/실행 추적/코드 리뷰와 다크·라이트 테마 전환 경험을 유지하면서, 기술에 종속되지 않는 데이터 모델을 도입한다.

## 제한

- 실제 사용자 코드 실행, 임의의 shell 명령 실행, GitHub OAuth, 로그인, 결제, 외부 AI API 호출 및 서버 인프라는 구현하지 않는다.
- 검증된 학습 시나리오와 실제 런타임 계측 결과를 혼동하지 않는다. 시안은 `curated_simulation`으로 표기한다.
- 기존 UI를 이관하면서 특정 언어 전용 모델로 하드코딩하지 않는다. Java/JavaScript/Python 샘플을 정당한 언어별 설명으로 유지한다.
- 새 라이브러리·컴포넌트 설계를 선택한 근거를 PR 설명과 ADR에 남긴다.

## 순서

1. 현행 프로토타입 구조를 파악하고 변경 계획·파일 목록·불확실성을 간략히 설명한다.
2. `apps/web` React/TypeScript/Vite 프로젝트와 PWA 기본 설정을 구성한다.
3. `Scenario`, `TraceStep`, `Visualization`의 버전 관리 가능한 타입·JSON fixture를 설계한다.
4. Home, StackPicker, TracePlayer, ReviewChallenge를 시안과 동등한 사용자 경험으로 구현한다.
5. 반응형(360/390px)과 OS 테마 기본값, 명시적 다크/라이트 전환, 저장/새로고침 후 유지, 두 테마의 코드 대비와 포커스 표시를 구현·테스트한다.
6. step 경계조건, 이전/다음, 자동 재생/정지, 네비게이션 시 타이머 정리, 리뷰 정답 확인, 미지원 스택 관심 상태 테스트를 작성한다.
7. typecheck, lint, test, build를 실행하고 실제 결과를 보고한다. 실행 환경에서 불가능하면 사유와 미실행 항목을 분리한다.
8. README와 개발 문서를 업데이트한다.

## 수용 조건

- 360px/390px 모바일 폭에서 주요 조작이 가능하며 코드 영역 이외에 불필요한 수평 스크롤이 없다.
- 서로 다른 2개 이상의 언어가 서로의 trace 데이터를 섞어 사용하지 않는다.
- 사용자 입력에 의존하지 않는 검증된 sample trace만 재생한다.
- 미지원 기술은 명확히 관심 등록 상태를 보여준다.
- 실행 기록이라는 오해를 막는 출처 라벨을 유지한다.
- 주요 상호작용, 다크/라이트 전환 및 선호 유지의 자동화 테스트가 통과한다.
- 브랜드 문자열은 중앙 관리하여 정식 출시 전에 쉽게 변경 가능하게 한다.

저장소 초기화 작업은 별도 진행되었으며 Codex는 이 이슈 범위의 코드 및 테스트만 PR로 제안한다. 임의 배포·결제 활성화는 하지 않는다.