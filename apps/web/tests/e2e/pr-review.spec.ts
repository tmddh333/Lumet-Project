import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function fillReview(page: Page) {
  await page.getByLabel("리뷰할 줄", { exact: true }).selectOption("4");
  await page.getByLabel("문제 유형", { exact: true }).selectOption("async");
  await page
    .getByLabel("언제 발생하나요?", { exact: true })
    .fill("앞선 검색의 응답이 더 늦게 도착할 때");
  await page
    .getByLabel("어떤 영향을 주나요?", { exact: true })
    .fill("이전 검색 결과가 최신 검색 결과를 덮어씁니다");
}
async function accessible(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
}

test("PR review reveals feedback only after reasoning, and works in both themes", async ({
  page,
}, info) => {
  for (const theme of ["light", "dark"] as const) {
    // Revisit as a new learner, to check the initial state for each theme.
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/#trace/javascript-search-race");
    await expect(page).toHaveURL(/#review\/javascript-search-race$/);
    await expect(
      page.getByRole("heading", { name: "내 리뷰 작성" }),
    ).toBeVisible();
    await expect(page.getByTestId("step-label")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "검증된 관점과 내 리뷰 비교" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "리뷰 제출하고 근거 비교" }),
    ).toBeDisabled();
    await accessible(page);
    await page.screenshot({
      path: info.outputPath(`pr-before-${theme}.png`),
      fullPage: true,
    });
    const line = page.getByRole("button", {
      name: "새 코드 4행 추가: results = data;",
    });
    await line.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("리뷰할 줄", { exact: true })).toHaveValue(
      "4",
    );
    await page.getByRole("button", { name: /생각할 거리 힌트/ }).click();
    await expect(
      page.getByText("시작한 순서와 완료되는 순서가 항상 같을까요?"),
    ).toBeVisible();
    await fillReview(page);
    await page.getByRole("button", { name: /모드로 전환/ }).click();
    await expect(
      page.getByLabel("언제 발생하나요?", { exact: true }),
    ).toHaveValue("앞선 검색의 응답이 더 늦게 도착할 때");
    await page.getByRole("button", { name: /모드로 전환/ }).click();
    await page.getByRole("button", { name: "리뷰 제출하고 근거 비교" }).click();
    await expect(
      page.getByRole("heading", { name: "검증된 관점과 내 리뷰 비교" }),
    ).toBeFocused();
    await expect(
      page.getByText(/작성한 문장의 정확성은 자동 채점하지 않습니다/),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "가능한 수정 방법 하나" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "수정 예시 펼치기" }).click();
    await accessible(page);
    await page.screenshot({
      path: info.outputPath(`pr-after-${theme}.png`),
      fullPage: true,
    });
    await page.getByLabel("이 개념을 다시 복습하기").check();
    await page.getByRole("link", { name: "상태 변화로 검증하기" }).click();
    await expect(page.getByTestId("step-label")).toHaveText("0 / 5 단계");
    await page.getByRole("button", { name: "다음 →" }).click();
    await page.getByRole("button", { name: "다음 →" }).click();
    await expect(page.getByText("이전:", { exact: false })).toBeVisible();
    await accessible(page);
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "홈", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "다시 살펴볼 개념" }),
    ).toBeVisible();
    await accessible(page);
  }
});

test("topic paths, opt-in progress and deletion survive a real reload", async ({
  page,
}) => {
  await page.goto("/#stacks");
  await page.getByLabel("JavaScript 선택", { exact: true }).check();
  await page.getByLabel("난이도", { exact: true }).selectOption("practice");
  await page
    .getByLabel("주제", { exact: true })
    .selectOption("비동기·응답 순서");
  await expect(page.getByText("조건에 맞는 시나리오 1개")).toBeVisible();
  await page.getByRole("link", { name: /검색 자동완성/ }).click();
  await fillReview(page);
  await page.getByRole("button", { name: "리뷰 제출하고 근거 비교" }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("lumet.progress.v1")),
  ).toBeNull();
  await page.getByRole("link", { name: "상태 변화로 검증하기" }).click();
  await page.getByRole("button", { name: "다음 →" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "홈", exact: true })
    .click();
  await page.getByLabel("이 기기에 학습 진도 저장").check();
  const stored = await page.evaluate(() =>
    localStorage.getItem("lumet.progress.v1"),
  );
  expect(stored).not.toContain("응답");
  expect(stored).not.toContain("condition");
  await page.reload();
  await page.getByRole("link", { name: /이어서 학습하기/ }).click();
  await expect(page.getByTestId("step-label")).toHaveText("1 / 5 단계");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "홈", exact: true })
    .click();
  await page.getByLabel("이 기기에 학습 진도 저장").uncheck();
  expect(
    await page.evaluate(() => localStorage.getItem("lumet.progress.v1")),
  ).toBeNull();
  await page.reload();
  await expect(page.getByRole("link", { name: /이어서 학습하기/ })).toHaveCount(
    0,
  );
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "기술 탐색" })
    .click();
  await page.getByRole("button", { name: "프레임워크", exact: true }).click();
  await page.getByLabel("React 선택", { exact: true }).check();
  await expect(page.getByText(/React 학습 시나리오는 준비 중/)).toBeVisible();
});

test("new practical review is usable offline without contacting AI or a server", async ({
  page,
  context,
}) => {
  await page.goto("/#review/python-default-tags");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "태그 추가 함수에 기본값 도입",
  );
  await page.getByLabel("리뷰할 줄", { exact: true }).selectOption("1");
  await page.getByLabel("문제 유형", { exact: true }).selectOption("state");
  await page
    .getByLabel("언제 발생하나요?", { exact: true })
    .fill("기본 인자로 함수를 반복 호출할 때");
  await page
    .getByLabel("어떤 영향을 주나요?", { exact: true })
    .fill("이전 호출의 태그가 섞입니다");
  await page.getByRole("button", { name: "리뷰 제출하고 근거 비교" }).click();
  await expect(
    page.getByRole("heading", { name: "검증된 관점과 내 리뷰 비교" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "상태 변화로 검증하기" }).click();
  await page.getByRole("button", { name: "다음 →" }).click();
  await expect(page.getByTestId("step-label")).toHaveText("1 / 3 단계");
});
