# Lumet (루멧) · 무료 개발자 학습 PWA

> **Illuminate the code.** 코드를 읽고, 상태 변화를 추적하고, 스스로 리뷰하는 모바일 우선 학습 공간. Lumet은 정식 상표 검토 전 가칭입니다.

## 시작하기

Node.js 24.15 이상인 24.x를 권장합니다(`nvm use`). Node 22.22.2 이상인 22.x와 Node 26 이상도 지원하며 npm이 필요합니다. 테스트 도구의 요구 버전을 포함한 기준입니다.

```bash
npm ci
npm run dev
# http://127.0.0.1:5173
```

`apps/web`의 React + TypeScript + Vite 앱입니다. 원래 문서에서 언급한 `prototype/`와 `scripts/check_project.py`는 저장소에 제공되지 않았습니다. 이번 구현은 [PRD v0.2](docs/product/PRD-v0.2.md)와 [디자인 가이드](docs/design/DESIGN.md)를 기준으로 작성했습니다.

## 학습 경험

- **홈 → 기술 탐색 → 실행 추적 → 코드 리뷰 → 근거 해설** 전체가 가입·결제 없이 무료입니다.
- Java 17 증감 연산, JavaScript 객체 참조, Python 리스트 복사 시나리오를 제공합니다. 각 샘플의 버전·가정·공식 문서 근거를 화면에서 확인할 수 있습니다.
- 코드는 실행하지 않습니다. 화면에 **검증된 학습 시나리오 · 실제 코드 실행 아님**을 표시하고 미리 작성한 JSON 단계를 재생합니다.
- 이전/다음, 단계 선택, 자동 재생/일시정지, 속도 조절을 제공합니다. 화면·시나리오 이동, 숨겨진 탭, 완료 시 타이머를 정리합니다.
- 기술 검색과 복수 선택을 지원합니다. 미지원 기술은 준비 중 상태와 기기 내 관심 등록을 제공하며, 다른 언어로 자동 이동하지 않습니다.
- OS 테마를 기본으로 따릅니다. 다크/라이트 전환과 시스템 모드 복귀를 지원하고 명시적 선호를 저장합니다.
- 저장하는 정보는 테마와 사용자가 등록한 관심 기술뿐입니다. 코드·리뷰 초안·이용 이벤트를 수집하거나 전송하지 않습니다.

## 검증

언어별 대조 테스트에는 **JDK 17 이상**(`java`, `javac`)과 **Python 3.11 이상**(`python3`)이 필요합니다. 런타임 누락은 성공이나 건너뛰기로 처리하지 않고 실패합니다.

```bash
npx playwright install chromium
npm run typecheck
npm run lint
npm test
npm run test:runtime
npm run build
npm run test:e2e
# 모든 단계: npm run check
```

단위/컴포넌트 테스트는 상태 경계, 타이머, 언어 분리, 리뷰, 관심 등록, 테마·저장 실패를 검사합니다. 런타임 테스트는 저장소의 고정된 샘플 각 문장 직후 상태를 Node·Java·Python과 대조합니다. Playwright는 Chromium의 360px/390px/1280px 화면에서 양쪽 테마, axe 접근성, 실제 탐색과 오프라인 학습을 검사합니다.

## PWA 미리보기

```bash
npm run build
npm run preview
# http://127.0.0.1:4173
```

프로덕션 빌드에 설치용 매니페스트, 192/512px 아이콘과 서비스 워커를 생성합니다. 최초 온라인 방문에서 캐시 설치를 마치면 세 언어의 추적·리뷰를 오프라인으로 사용할 수 있습니다. 처음부터 오프라인인 기기에는 앱이 없습니다. 개발 서버에는 서비스 워커를 등록하지 않습니다.

배포할 경우 HTTPS와 origin 루트(`/`) 호스팅이 필요합니다. 브라우저 설치 메뉴와 모바일 실기기 설치 여부는 별도 검증 대상이며, 이 PR은 배포하지 않습니다. 업데이트는 기존 앱 탭을 모두 닫은 뒤 다음 방문에 적용됩니다.

## 문서

- [개발·콘텐츠·검증 안내](docs/development/WEB.md)
- [아키텍처](docs/architecture/ARCHITECTURE.md), [ADR: PWA와 검증 경계](docs/adr/0002-static-react-pwa.md)
- [제품 요구사항](docs/product/PRD-v0.2.md), [디자인·테마 토큰](docs/design/DESIGN.md)
- [브랜드 검토](docs/product/BRAND.md), [작업 지침](AGENTS.md)

실기기 설치, Safari/Firefox 및 스크린리더 수동 점검, 5명 이상의 사용성 피드백은 자동화 테스트와 별개 후속 작업입니다.
