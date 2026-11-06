import { StrictMode } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { prScenarios } from "../src/content/catalog";
import { consentKey, progressKey, parseProgress } from "../src/domain/progress";
import {
  canSubmitReview,
  compareReview,
  emptyReview,
} from "../src/domain/review";
import { createDiff } from "../src/domain/diff";

function navigate(hash: string) {
  act(() => {
    history.replaceState(null, "", `/#${hash}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}
function mount(hash: string) {
  history.replaceState(null, "", `/#${hash}`);
  return render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
function fillReview(line = "4", category = "async") {
  fireEvent.change(screen.getByLabelText("리뷰할 줄"), {
    target: { value: line },
  });
  fireEvent.change(screen.getByLabelText("문제 유형"), {
    target: { value: category },
  });
  fireEvent.change(screen.getByLabelText("언제 발생하나요?"), {
    target: { value: "나중에 요청한 응답이 먼저 도착할 때" },
  });
  fireEvent.change(screen.getByLabelText("어떤 영향을 주나요?"), {
    target: { value: "현재 입력과 다른 결과를 표시합니다" },
  });
}

describe("reviewer-first PR experience", () => {
  it.each(prScenarios)(
    "$scenarioId hides evidence until a reasoned submission",
    async (scenario) => {
      const user = userEvent.setup();
      mount(`review/${scenario.scenarioId}`);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        scenario.title,
      );
      expect(
        screen.queryByText(scenario.review.finding.rationale),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "수정 예시 펼치기" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("step-label")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "리뷰 제출하고 근거 비교" }),
      ).toBeDisabled();
      fillReview(
        String(scenario.review.finding.lines[0]),
        scenario.review.finding.category,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "리뷰 제출하고 근거 비교" }),
      );
      expect(screen.getByText(scenario.review.finding.rationale)).toBeVisible();
      expect(
        screen.getByRole("heading", { name: "검증된 관점과 내 리뷰 비교" }),
      ).toHaveFocus();
      expect(
        screen.getByText(/작성한 문장의 정확성은 자동 채점하지 않습니다/),
      ).toBeVisible();
      expect(
        screen.queryByText(scenario.review.fix.explanation),
      ).not.toBeInTheDocument();
      await user.click(
        screen.getByRole("button", { name: "수정 예시 펼치기" }),
      );
      expect(screen.getByText(scenario.review.fix.explanation)).toBeVisible();
      navigate(`trace/${scenario.scenarioId}`);
      for (const step of scenario.steps.slice(1)) {
        fireEvent.click(screen.getByRole("button", { name: "다음 →" }));
        expect(screen.getByTestId("step-label")).toHaveTextContent(
          `${step.id} / ${scenario.steps.length - 1} 단계`,
        );
        expect(screen.getByText(step.explanation)).toBeVisible();
        expect(document.querySelector(".active-line")).toHaveTextContent(
          scenario.code.split("\n")[step.line! - 1]!.trim(),
        );
      }
      navigate(`review/${scenario.scenarioId}`);
      expect(screen.getByText(scenario.review.finding.rationale)).toBeVisible();
      expect(screen.getByLabelText("언제 발생하나요?")).toHaveValue(
        "나중에 요청한 응답이 먼저 도착할 때",
      );
    },
  );
  it("blocks direct trace links before review and makes hints opt-in", async () => {
    mount("trace/javascript-search-race");
    expect(screen.queryByTestId("step-label")).not.toBeInTheDocument();
    const review = prScenarios.find(
      (item) => item.scenarioId === "javascript-search-race",
    )!.review;
    expect(screen.queryByText(review.hints[0]!)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /생각할 거리 힌트/ }));
    expect(screen.getByText(review.hints[0]!)).toBeVisible();
    expect(
      screen.queryByText(review.finding.rationale),
    ).not.toBeInTheDocument();
    await screen.findByRole("heading", { name: "내 리뷰 작성" });
  });
  it("preserves selected diff line and reasoning across themes; editing hides stale feedback", () => {
    mount("review/javascript-search-race");
    fireEvent.click(
      screen.getByRole("button", { name: "새 코드 4행 추가: results = data;" }),
    );
    expect(screen.getByLabelText("리뷰할 줄")).toHaveValue("4");
    fillReview();
    fireEvent.click(screen.getByRole("button", { name: "다크 모드로 전환" }));
    expect(screen.getByLabelText("리뷰할 줄")).toHaveValue("4");
    fireEvent.click(
      screen.getByRole("button", { name: "리뷰 제출하고 근거 비교" }),
    );
    expect(screen.getByText(/핵심 관점과 일치합니다/)).toBeVisible();
    fireEvent.change(screen.getByLabelText("어떤 영향을 주나요?"), {
      target: { value: "다른 관점으로 수정" },
    });
    expect(
      screen.queryByRole("heading", { name: "검증된 관점과 내 리뷰 비교" }),
    ).not.toBeInTheDocument();
  });
  it("keeps alternative findings for comparison and offers a personal revisit flag", () => {
    mount("review/javascript-search-race");
    fillReview("1", "other");
    fireEvent.click(
      screen.getByRole("button", { name: "리뷰 제출하고 근거 비교" }),
    );
    expect(screen.getByText(/검증된 관점에 차이가 있습니다/)).toBeVisible();
    expect(
      screen.getByRole("checkbox", { name: "이 개념을 다시 복습하기" }),
    ).toBeChecked();
    navigate("home");
    expect(
      screen.getByRole("heading", { name: "다시 살펴볼 개념" }),
    ).toBeVisible();
  });
});

describe("learning paths and private progress", () => {
  it("filters selected lessons by topic/level and keeps frameworks honestly unavailable", () => {
    mount("stacks");
    fireEvent.click(screen.getByLabelText("JavaScript 선택"));
    expect(screen.getByText("조건에 맞는 시나리오 3개")).toBeVisible();
    fireEvent.change(screen.getByLabelText("난이도"), {
      target: { value: "practice" },
    });
    expect(screen.getByText("조건에 맞는 시나리오 2개")).toBeVisible();
    fireEvent.change(screen.getByLabelText("주제"), {
      target: { value: "비동기·응답 순서" },
    });
    expect(screen.getByText("조건에 맞는 시나리오 1개")).toBeVisible();
    expect(screen.getByRole("link", { name: /검색 자동완성/ })).toHaveAttribute(
      "href",
      "#review/javascript-search-race",
    );
    fireEvent.click(screen.getByRole("button", { name: "프레임워크" }));
    fireEvent.click(screen.getByLabelText("React 선택"));
    expect(screen.getByText(/React 학습 시나리오는 준비 중/)).toBeVisible();
    expect(
      screen.getByRole("button", { name: "React 관심 등록" }),
    ).toBeVisible();
  });
  it("only persists coarse progress after consent, resumes steps, and deletes on opt-out", () => {
    const view = mount("review/javascript-search-race");
    fillReview();
    fireEvent.click(
      screen.getByRole("button", { name: "리뷰 제출하고 근거 비교" }),
    );
    expect(localStorage.getItem(progressKey)).toBeNull();
    navigate("trace/javascript-search-race");
    fireEvent.click(screen.getByRole("button", { name: "다음 →" }));
    navigate("home");
    fireEvent.click(
      screen.getByRole("checkbox", { name: "이 기기에 학습 진도 저장" }),
    );
    const stored = localStorage.getItem(progressKey)!;
    expect(stored).not.toContain("나중에 요청");
    expect(stored).not.toContain("condition");
    expect(stored).not.toContain("results =");
    expect(JSON.parse(stored).lessons["javascript-search-race"].step).toBe(1);
    view.unmount();
    mount("home");
    const resume = screen.getByRole("link", { name: /이어서 학습하기/ });
    expect(resume).toHaveAttribute("href", "#trace/javascript-search-race");
    navigate("trace/javascript-search-race");
    expect(screen.getByTestId("step-label")).toHaveTextContent("1 / 5 단계");
    navigate("home");
    fireEvent.click(
      screen.getByRole("checkbox", { name: "이 기기에 학습 진도 저장" }),
    );
    expect(localStorage.getItem(progressKey)).toBeNull();
    expect(localStorage.getItem(consentKey)).toBeNull();
  });
  it("survives storage failures and resets the review unlock with progress", () => {
    mount("review/javascript-search-race");
    fillReview();
    fireEvent.click(
      screen.getByRole("button", { name: "리뷰 제출하고 근거 비교" }),
    );
    navigate("home");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "이 기기에 학습 진도 저장" }),
    );
    expect(screen.getByText(/기기 저장 변경에 실패/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "학습 진도 초기화" }));
    navigate("trace/javascript-search-race");
    expect(screen.queryByTestId("step-label")).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("main")).getByRole("heading", {
        name: "내 리뷰 작성",
      }),
    ).toBeVisible();
  });
});

describe("contracts used by the reviewer experience", () => {
  it("validates required selections and meaningful nonblank fields without grading wording", () => {
    expect(canSubmitReview(emptyReview, 10)).toBe(false);
    const draft = {
      ...emptyReview,
      line: 4,
      category: "async" as const,
      condition: "  ",
      impact: "test",
    };
    expect(canSubmitReview(draft, 10)).toBe(false);
    draft.condition = "any words";
    expect(canSubmitReview(draft, 10)).toBe(true);
    expect(canSubmitReview({ ...draft, line: 11 }, 10)).toBe(false);
    expect(
      compareReview(
        draft,
        prScenarios.find(
          (item) => item.scenarioId === "javascript-search-race",
        )!.review,
      ),
    ).toEqual({ lineMatches: true, categoryMatches: true });
  });
  it("sanitizes saved progress and clamps stored positions", () => {
    expect(parseProgress("bad json")).toEqual({ lessons: {} });
    const parsed = parseProgress(
      JSON.stringify({
        lessons: {
          "java-increment": {
            step: 100,
            reviewed: true,
            needsPractice: false,
            condition: "secret",
          },
          missing: { step: 1 },
        },
        last: { id: "missing", page: "trace" },
      }),
    );
    expect(parsed).toEqual({
      lessons: {
        "java-increment": { step: 3, reviewed: true, needsPractice: false },
      },
    });
  });
  it.each([
    ["a\nb\na", "a\nc\na"],
    ["x\ny", "y"],
    ["", "a"],
    ["a", ""],
    ["x", "x"],
  ])(
    "diff preserves source order and independent line numbers",
    (before, after) => {
      const diff = createDiff(before, after);
      const old = diff.filter((line) => line.kind !== "added");
      const next = diff.filter((line) => line.kind !== "removed");
      expect(old.map((line) => line.text).join("\n")).toBe(before);
      expect(next.map((line) => line.text).join("\n")).toBe(after);
      expect(old.map((line) => line.oldLine)).toEqual(
        old.map((_, index) => index + 1),
      );
      expect(next.map((line) => line.newLine)).toEqual(
        next.map((_, index) => index + 1),
      );
    },
  );
});
