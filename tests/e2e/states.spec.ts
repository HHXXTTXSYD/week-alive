import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

test("fallback layouts fit phones, tablets and large desktops", async ({
  page,
}) => {
  // Render the real fallback components in the app shell without disrupting a database.
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  const states: [string, string][] = JSON.parse(
    execFileSync(
      process.execPath,
      ["--import", "tsx", "tests/fixtures/render-states.ts"],
      { encoding: "utf8" },
    ),
  );
  for (const width of [320, 390, 768, 1440, 2560]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [name, markup] of states) {
      await page.locator("main").evaluate((main, html) => {
        main.innerHTML = html;
      }, markup);
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      const header = await page.locator(".header").boundingBox();
      const content = await page
        .locator(name === "error" ? ".state-sheet" : ".loading-content")
        .boundingBox();
      expect(content!.y - (header!.y + header!.height)).toBeGreaterThanOrEqual(
        28,
      );
      if (name === "error") {
        expect(content!.width).toBeLessThanOrEqual(720);
        expect(content!.height).toBeLessThan(600);
        await expect(
          page.getByRole("button", { name: "重新加载" }),
        ).toBeVisible();
      } else {
        await expect(page.getByRole("status")).toHaveAttribute(
          "aria-busy",
          "true",
        );
        await page.emulateMedia({ reducedMotion: "reduce" });
        expect(
          await page
            .locator(".loading-calendar > div")
            .first()
            .evaluate((el) => getComputedStyle(el).animationName),
        ).toBe("none");
        await page.emulateMedia({ reducedMotion: "no-preference" });
        expect(
          await page
            .locator(".loading-calendar > div")
            .first()
            .evaluate((el) => getComputedStyle(el).animationName),
        ).toBe("calendar-turn");
      }
      if (width === 390 || width === 1440) {
        await page.screenshot({
          path: `tmp/${name}-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
});

test("404 keeps navigation usable on a small phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/this-page-does-not-exist");
  await expect(
    page.getByRole("heading", { name: "这一页暂时走丢了" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("link", { name: "回到公司库" }).click();
  await expect(page).toHaveURL(/\/companies$/);
});
