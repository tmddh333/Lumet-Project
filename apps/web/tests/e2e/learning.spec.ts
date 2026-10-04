import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

test("all four screens are readable and accessible in both themes", async ({
  page,
}, testInfo) => {
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    for (const route of [
      "home",
      "stacks",
      "trace/javascript-reference",
      "review/javascript-reference",
    ]) {
      await page.goto(`/#${route}`);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await noOverflow(page);
      const violations = (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations;
      expect(violations).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`${route.split("/")[0]}-${theme}.png`),
        fullPage: true,
      });
    }
  }
});

test("free learning, selection, review and persisted theme", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "내 기술로 시작하기" }).click();
  await page.getByLabel("Java 선택", { exact: true }).check();
  await page.getByLabel("Python 선택", { exact: true }).check();
  await page.getByRole("link", { name: /Python.*복사한 리스트/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "복사한 리스트는 어디까지 같을까?",
  );
  await page.getByRole("button", { name: "다음 →" }).click();
  await page.getByRole("button", { name: /모드로 전환/ }).click();
  const theme = await page.locator("html").getAttribute("data-theme");
  await expect(page.getByTestId("step-label")).toHaveText("1 / 3 단계");
  await page.getByRole("button", { name: /자동 재생/ }).click();
  await page.getByLabel("재생 속도").selectOption("2");
  await expect(page.getByText("추적 완료", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "다음 →" })).toBeDisabled();
  await page.getByRole("link", { name: "리뷰로 이해 확인" }).click();
  await page.getByLabel("[1, 2] · 원본 리스트는 유지된다").check();
  await page.getByRole("button", { name: "답 제출하고 해설 보기" }).click();
  await expect(
    page.getByRole("heading", { name: "정확하게 이해했어요." }),
  ).toBeVisible();
  await noOverflow(page);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme!);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "복사한 리스트는 어디까지 같을까?",
  );
});

test("unsupported technology stays unavailable and interest persists", async ({
  page,
}) => {
  await page.goto("/#stacks");
  await page.getByRole("searchbox").fill("Rust");
  await page.getByLabel("Rust 선택", { exact: true }).check();
  await expect(page.getByText(/Rust 학습 시나리오는 준비 중/)).toBeVisible();
  await page.getByRole("button", { name: "Rust 관심 등록" }).click();
  await expect(page).toHaveURL(/#stacks$/);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Rust 관심 해제" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/#trace/rust");
  await expect(
    page.getByRole("heading", { name: "학습 페이지를 찾을 수 없어요" }),
  ).toBeVisible();
});

test("browser back stops playback; keyboard controls have visible focus", async ({
  page,
}) => {
  await page.goto("/#home");
  await page.getByRole("link", { name: /JavaScript.*const인데/ }).click();
  await page.getByRole("button", { name: /자동 재생/ }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "기술 탐색" })
    .click();
  await page.goBack();
  await expect(page.getByTestId("step-label")).toHaveText("0 / 3 단계");
  await expect(page.getByRole("button", { name: /자동 재생/ })).toBeVisible();
  const next = page.getByRole("button", { name: "다음 →" });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("step-label")).toHaveText("1 / 3 단계");
  await expect(next).toBeFocused();
  expect(
    await next.evaluate((button) => getComputedStyle(button).outlineStyle),
  ).not.toBe("none");
});

test("install metadata and precached learning work offline after first load", async ({
  page,
  context,
}) => {
  await page.goto("/#trace/java-increment");
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
  const manifest = await page.evaluate(async () =>
    (await fetch("/manifest.webmanifest")).json(),
  );
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual([
    "192x192",
    "512x512",
  ]);
  expect(
    await page.evaluate(async () => {
      const icon = new Image();
      icon.src = "/icon-512.png";
      await icon.decode();
      return icon.naturalWidth;
    }),
  ).toBe(512);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "같은 ++, 다른 순간",
  );
  await page.getByRole("button", { name: "다음 →" }).click();
  await expect(page.getByTestId("step-label")).toHaveText("1 / 3 단계");
  await page.getByRole("link", { name: "리뷰로 이해 확인" }).click();
  await page.getByLabel("b = 10, c = 12").check();
  await page.getByRole("button", { name: "답 제출하고 해설 보기" }).click();
  await expect(
    page.getByRole("heading", { name: "정확하게 이해했어요." }),
  ).toBeVisible();
});
