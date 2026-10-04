import { useEffect, useRef, useState } from "react";
import brand from "./brand.json";
import { findScenario, stacks } from "./content/catalog";
import { useTheme } from "./hooks/useTheme";
import { readPreference, savePreference } from "./lib/storage";
import { Home } from "./screens/Home";
import { StackPicker } from "./screens/StackPicker";
import { TracePlayer } from "./screens/TracePlayer";
import { ReviewChallenge } from "./screens/ReviewChallenge";
import { Icon, type IconName } from "./components/Icon";

function readInterests(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      readPreference("lumet.interests") ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter(
          (id): id is string =>
            typeof id === "string" &&
            stacks.some(
              (stack) => stack.id === id && stack.status !== "available",
            ),
        )
      : [];
  } catch {
    return [];
  }
}
const tabs: { route: string; text: string; icon: IconName }[] = [
  { route: "home", text: "홈", icon: "home" },
  { route: "stacks", text: "기술 탐색", icon: "stacks" },
  { route: "trace", text: "실행 추적", icon: "trace" },
  { route: "review", text: "코드 리뷰", icon: "review" },
];

export default function App() {
  const [hash, setHash] = useState(() => location.hash.slice(1) || "home");
  const [selected, setSelected] = useState<string[]>([]);
  const [interests, setInterests] = useState(readInterests);
  const [storageFailed, setStorageFailed] = useState(false);
  const theme = useTheme();
  const main = useRef<HTMLElement>(null);
  const [page = "home", scenarioId] = hash.split("/");
  const scenario = findScenario(scenarioId);

  useEffect(() => {
    const navigate = () => setHash(location.hash.slice(1) || "home");
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  useEffect(() => {
    document.title = `${brand.name} · ${tabs.find((tab) => tab.route === page)?.text ?? "페이지 없음"}`;
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [hash, page]);

  function toggleSelection(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }
  function toggleInterest(id: string) {
    const next = interests.includes(id)
      ? interests.filter((item) => item !== id)
      : [...interests, id];
    setInterests(next);
    setStorageFailed(!savePreference("lumet.interests", JSON.stringify(next)));
  }
  const validPage = tabs.some((tab) => tab.route === page);

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        본문으로 이동
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#home" aria-label={`${brand.name} 홈`}>
            <img src="/icon.svg" width="32" height="32" alt="" />
            <span>{brand.name}</span>
            <small>LEARN</small>
          </a>
          <div className="theme-controls">
            <button
              className="theme-toggle"
              onClick={() =>
                theme.choose(theme.theme === "dark" ? "light" : "dark")
              }
              aria-label={`${theme.theme === "dark" ? "라이트" : "다크"} 모드로 전환`}
            >
              <Icon name={theme.theme === "dark" ? "sun" : "moon"} />
              <span>{theme.theme === "dark" ? "라이트" : "다크"}</span>
            </button>
            <button
              className="system-theme"
              aria-pressed={theme.preference === "system"}
              onClick={() => theme.choose("system")}
            >
              시스템
            </button>
          </div>
        </div>
      </header>
      {theme.storageFailed && (
        <p className="storage-warning" role="status">
          테마를 저장할 수 없어 현재 방문 동안만 적용합니다.
        </p>
      )}
      <main id="main-content" tabIndex={-1} ref={main}>
        {page === "home" && <Home />}
        {page === "stacks" && (
          <StackPicker
            selected={selected}
            onSelection={toggleSelection}
            interests={interests}
            onInterest={toggleInterest}
            storageFailed={storageFailed}
          />
        )}
        {page === "trace" && scenario && (
          <TracePlayer key={scenario.scenarioId} scenario={scenario} />
        )}
        {page === "review" && scenario && (
          <ReviewChallenge key={scenario.scenarioId} scenario={scenario} />
        )}
        {(!validPage ||
          ((page === "trace" || page === "review") && !scenario)) && (
          <div className="empty-state">
            <h1>
              {scenarioId || !validPage
                ? "학습 페이지를 찾을 수 없어요"
                : "학습할 기술을 먼저 골라 주세요"}
            </h1>
            <p>제공 중인 시나리오를 선택하면 추적과 리뷰를 시작할 수 있어요.</p>
            <a className="button primary" href="#stacks">
              기술 탐색하기
            </a>
          </div>
        )}
      </main>
      <nav className="bottom-nav" aria-label="주요 탐색">
        {tabs.map((tab) => (
          <a
            href={`#${tab.route}${(tab.route === "trace" || tab.route === "review") && scenario ? `/${scenario.scenarioId}` : ""}`}
            key={tab.route}
            aria-current={page === tab.route ? "page" : undefined}
          >
            <Icon name={tab.icon} />
            <span>{tab.text}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
