# Lumet (루멧) · prototype v0.2

> **Illuminate the code.** AI 시대 개발자가 코드를 읽고, 실행 흐름을 추적하며, 스스로 리뷰하도록 돕는 모바일 우선 학습 PWA. **Lumet은 정식 상표 검토 전 가칭**이다.

## 무료 콘텐츠 우선 원칙

무료로 기술 선택→코드 읽기→시각화→리뷰→해설을 온전히 제공한다. 유료 콘텐츠와 결제 기능은 별도 기획하며, 실제 이용 지표와 유료 수요 확인 전까지 활성화하지 않는다. 초기 제품에 무료 학습 제한·강제 광고·결제 게이트를 도입하지 않는다.

## 바로 실행

```bash
python3 -m http.server 4173 --directory prototype
# http://localhost:4173
```

- UI: `prototype/index.html` (정적 HTML/CSS/JS UX 프로토타입, React 앱 아님)
- 다크·라이트 테마: OS 설정을 기본으로 따름, 상단 버튼으로 전환하며 사용자 선택 저장
- 기술 샘플: Java·JavaScript·Python 검증된 시나리오, 다른 기술은 관심 표시
- 실행 단계는 정적 학습 시뮬레이션이며 **임의 사용자 코드가 실제로 실행되지는 않는다**.
- 문서: `docs/product/PRD-v0.2.md`, `docs/design/DESIGN.md`, `docs/architecture/ARCHITECTURE.md`, `docs/product/BRAND.md`
- Codex 지침: `AGENTS.md`, `CODEX_FIRST_TASK.md`, `GITHUB_SETUP.md`

## 검사

```bash
python3 scripts/check_project.py
```

정적 검사는 전체 React 구현, 모바일 실기기 PWA 설치, 실제 코드 실행의 성공을 의미하지 않는다.