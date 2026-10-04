import { StrictMode } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { scenarios } from "../src/content/catalog";
import { setSystemDark } from "./setup";

function navigate(hash: string) {
  act(() => {
    history.replaceState(null, "", `/#${hash}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}
function mountAt(hash: string) {
  history.replaceState(null, "", `/#${hash}`);
  return render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

describe("free learning loop", () => {
  it("searches and selects multiple stacks without substituting unavailable content", async () => {
    const user = userEvent.setup();
    mountAt("stacks");
    await user.click(screen.getByLabelText("Java 선택"));
    await user.click(screen.getByLabelText("Python 선택"));
    expect(screen.getByRole("link", { name: /같은 \+\+/ })).toHaveAttribute(
      "href",
      "#trace/java-increment",
    );
    expect(screen.getByRole("link", { name: /복사한 리스트/ })).toHaveAttribute(
      "href",
      "#trace/python-copy",
    );
    await user.type(screen.getByRole("searchbox"), "kOtLiN");
    expect(screen.queryByLabelText("Java 선택")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Kotlin 선택"));
    expect(screen.getByText(/Kotlin 학습 시나리오는 준비 중/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Kotlin 관심 등록" }));
    expect(JSON.parse(localStorage.getItem("lumet.interests")!)).toEqual([
      "kotlin",
    ]);
    expect(
      screen.getByRole("button", { name: "Kotlin 관심 해제" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(location.hash).toBe("#stacks");
    navigate("home");
    navigate("stacks");
    expect(screen.getByLabelText("Python 선택")).toBeChecked();
  });
  it("shows an empty search result and restores saved interests on reload", async () => {
    localStorage.setItem("lumet.interests", '["rust"]');
    const user = userEvent.setup();
    mountAt("stacks");
    expect(
      screen.getByRole("button", { name: "Rust 관심 해제" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.type(screen.getByRole("searchbox"), "unknown-stack");
    expect(screen.getByText(/검색 결과가 없습니다/)).toBeVisible();
  });
  it.each(scenarios)(
    "$language synchronizes code, values, explanation and review feedback",
    async (scenario) => {
      const user = userEvent.setup();
      mountAt(`trace/${scenario.scenarioId}`);
      expect(screen.getByRole("button", { name: /이전/ })).toBeDisabled();
      expect(
        screen.getByText(/검증된 학습 시나리오 · 실제 코드 실행 아님/),
      ).toBeVisible();
      for (const step of scenario.steps.slice(1)) {
        await user.click(screen.getByRole("button", { name: "다음 →" }));
        expect(screen.getByTestId("step-label")).toHaveTextContent(
          `${step.id} / 3 단계`,
        );
        expect(screen.getByText(step.explanation)).toBeVisible();
        expect(document.querySelector(".active-line")).toHaveTextContent(
          scenario.code.split("\n")[step.line! - 1]!,
        );
        for (const value of Object.values(step.state))
          expect(screen.getAllByText(value).length).toBeGreaterThan(0);
      }
      expect(screen.getByRole("button", { name: "다음 →" })).toBeDisabled();
      navigate(`review/${scenario.scenarioId}`);
      expect(
        screen.queryByText(scenario.review.rationale),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /답 제출/ })).toBeDisabled();
      const wrong = scenario.review.options.find(
        (option) => option.id !== scenario.review.answer,
      )!;
      await user.click(screen.getByLabelText(wrong.text));
      await user.click(screen.getByRole("button", { name: /답 제출/ }));
      expect(
        screen.getByRole("heading", { name: "다시 살펴볼 지점이 있어요." }),
      ).toBeVisible();
      await user.click(
        screen.getByLabelText(
          scenario.review.options.find(
            (option) => option.id === scenario.review.answer,
          )!.text,
        ),
      );
      expect(
        screen.queryByText(scenario.review.rationale),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /답 제출/ }));
      expect(
        screen.getByRole("heading", { name: "정확하게 이해했어요." }),
      ).toBeVisible();
      expect(screen.getByText(scenario.review.rationale)).toBeVisible();
    },
  );
  it("clears playback timers on route and scenario changes under StrictMode", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    mountAt("trace/java-increment");
    fireEvent.click(screen.getByRole("button", { name: /자동 재생/ }));
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(1600));
    navigate("trace/python-copy");
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByTestId("step-label")).toHaveTextContent("0 / 3 단계");
    expect(screen.queryByText("int a = 10;")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /자동 재생/ }));
    navigate("stacks");
    expect(vi.getTimerCount()).toBe(0);
  });
  it("handles unknown scenario routes honestly", () => {
    mountAt("trace/kotlin");
    expect(
      screen.getByRole("heading", { name: "학습 페이지를 찾을 수 없어요" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /자동 재생/ }),
    ).not.toBeInTheDocument();
  });
});

describe("theme and optional storage", () => {
  it("follows system changes until explicitly overridden and can return to system", async () => {
    setSystemDark(true);
    const user = userEvent.setup();
    mountAt("home");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    act(() => setSystemDark(false));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    await user.click(screen.getByRole("button", { name: "다크 모드로 전환" }));
    act(() => {
      setSystemDark(true);
      setSystemDark(false);
    });
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("lumet.theme")).toBe("dark");
    await user.click(screen.getByRole("button", { name: "시스템" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
  it("persists across remounts and preserves trace position and review selections", async () => {
    const user = userEvent.setup();
    const view = mountAt("trace/java-increment");
    await user.click(screen.getByRole("button", { name: "다음 →" }));
    await user.click(screen.getByRole("button", { name: "다크 모드로 전환" }));
    expect(screen.getByTestId("step-label")).toHaveTextContent("1 / 3");
    navigate("review/java-increment");
    const radio = screen.getByLabelText("b = 10, c = 12");
    await user.click(radio);
    await user.type(
      screen.getByLabelText(/그렇게 생각한 이유/),
      "후위 증가의 값",
    );
    await user.click(
      screen.getByRole("button", { name: "라이트 모드로 전환" }),
    );
    expect(radio).toBeChecked();
    expect(screen.getByRole("textbox")).toHaveValue("후위 증가의 값");
    expect(localStorage.length).toBe(1);
    view.unmount();
    setSystemDark(true);
    mountAt("home");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
  it("recovers from malformed and blocked storage without blocking learning", async () => {
    localStorage.setItem("lumet.interests", "broken json");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked");
    });
    const user = userEvent.setup();
    mountAt("stacks");
    await user.click(screen.getByRole("button", { name: "Go 관심 등록" }));
    expect(screen.getByText(/관심 선택은 현재 방문 동안만/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "다크 모드로 전환" }));
    expect(screen.getByText(/테마를 저장할 수 없어/)).toBeVisible();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(
      within(screen.getByRole("navigation")).getAllByRole("link"),
    ).toHaveLength(4);
  });
});
