# LUMET — 아키텍처 v0.1

## 1. 원칙

- **언어 비종속 뷰어**와 **언어별 계측/시나리오 생산자**를 분리한다.
- 모든 프로그래밍 언어를 하나의 상태 표현으로 우겨 넣지 않는다. `visualization.type`별 렌더러 확장 지원.
- 샘플에서 보이는 상태를 임의로 AI가 생성하지 않는다. 시나리오는 버전·가정·검증 테스트로 관리한다.
- 프로토타입 단계에 실제 코드 실행기는 없다. 데모를 '실행'이라고 오해하지 않게 UI에 출처 유형 표시.

## 2. 단계별 컴포넌트

### Stage 0: UX 프로토타입

```
Browser (mobile/desktop)
  └─ Static HTML/CSS/JS prototype
     ├─ StackCatalog
     ├─ CuratedScenarioStore (static content)
     ├─ TracePlayer (step state machine)
     └─ ReviewChallenge
```

### Stage 1: 실제 PWA + 콘텐츠 API

```
React + TypeScript + Vite PWA
  ├─ StackPicker / Lesson / TracePlayer / Review
  ├─ RendererRegistry (variables / call graph / query plan ...)
  └─ REST over HTTPS
                │
      Spring Boot API
        ├─ Catalog / Content / Progress / Preference
        ├─ PostgreSQL
        └─ Content validation pipeline
```

### Stage 2: 사용자 코드 분석 (별도 설계 및 보안 심사)

```
PWA → API (identity, quotas, audit)
          └─ Job queue → Isolated language runner(s)
                             └─ Runtime-specific tracer
                                  → Normalizer → TraceStore → API → PWA
```

**보안 경계:** 사용자 코드를 API 프로세스 내부에서 절대로 실행하지 않는다. 실행 잡은 인증·쿼터·CPU/메모리/시간/출력 제한, 임시 파일 분리, 권한 축소, 기본 네트워크 차단, 수명 제한이 필요하다. 컨테이너만으로 모든 악성 코드 격리가 보장되지는 않으므로 실제 출시 전 별도의 샌드박스 보안 검토가 필요하다.

## 3. 콘텐츠 데이터 모델 제안

```json
{
  "scenarioId": "java-post-increment-001",
  "language": "java",
  "languageVersion": "21",
  "topic": "post-increment",
  "executionKind": "curated_simulation",
  "preconditions": ["단일 스레드", "별도 예외 없음"],
  "code": "int a = 10;\nint b = a++;",
  "visualization": {"type": "variables", "schemaVersion": 1},
  "steps": [
    {"id": 0, "line": null, "state": {}, "explanation": "실행 전"},
    {"id": 1, "line": 1, "state": {"a": "10"}, "explanation": "a에 10 저장"},
    {"id": 2, "line": 2, "state": {"a": "11", "b": "10"}, "explanation": "기존 a를 b에 저장 후 a 증가"}
  ],
  "review": {"question": "b의 값은?", "answer": "10", "rationale": "후위 증가"},
  "verification": {"method": "runtime_test", "reference": "tests/scenarios/java-post-increment-001"}
}
```

`executionKind`는 `curated_simulation | recorded_runtime_trace`로 구분. 미래의 AI 해설은 `ai_interpretation`이라는 **별도 필드**로 저장하고 실행 사실로 취급하지 않는다. 값 표시 표현과 타입은 언어별 의미에 맞게 버전 관리한다.

## 4. UI 재생 상태 머신

`idle → paused(step=0) ⇄ playing → paused(step=n) → completed`

- `previous`와 `next`는 범위를 넘어가지 않는다.
- 마지막 단계에서 자동재생을 정지하고 `completed`로 전환한다.
- 탭을 떠나거나 시나리오를 변경하면 타이머를 정리한다.
- 단계 선택은 단일 source of truth(`currentStepIndex`)를 사용한다.
- 모든 단계는 코드 강조, 변수/상태, 설명을 같은 인덱스로 갱신한다.

## 5. API 초안 (Stage 1)

- `GET /api/v1/stacks?query=...` : 기술 목록/지원 상태
- `GET /api/v1/stacks/{id}/scenarios` : 콘텐츠 목록
- `GET /api/v1/scenarios/{id}` : 스키마/단계/리뷰
- `POST /api/v1/stack-interests` : 미지원 기술 관심 등록(남용 방지)
- `PUT /api/v1/me/progress/{scenarioId}` : 로그인 사용자 진행도

미로그인 학습은 LocalStorage/IndexedDB에서 시작하고, 사용자가 동의 후 로그인하면 진행도를 동기화한다. 서버 유료 정보는 클라이언트 상태를 신뢰하지 않는다.

## 6. 비기능 기준

- 모바일 360px 기준 가로 스크롤은 코드 영역으로 제한.
- 조작 타깃 최소 44px 목표, 키보드 포커스·스크린리더 레이블.
- 느린 통신 시 skeleton과 재시도; 설치 후 오프라인 지원 범위를 명시.
- 원본 저장소 토큰과 코드 전문은 로깅 금지. 불필요한 영구 저장 금지.
- 요청 ID, 에러 비율, 95백분위 API 지연, 실행 원가를 운영 지표로 축적.

## 7. 미결정 항목

- 공식 브랜드, 도메인, 법률·상표 검토.
- 초기 베타의 인증 방식 및 분석 도구.
- 유료 분석 과금 단위 및 실제 런너 격리 플랫폼.
- 오픈소스 범위 및 콘텐츠 라이선스.