import { test, expect } from "@playwright/test";
test("desktop discovery and mobile layouts", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /好工作/ })).toBeVisible();
  test.skip(
    (await page.locator(".demo-banner").count()) === 0,
    "演示数据流程仅在未连接数据库时运行；真实模式由 ui.spec.ts 覆盖",
  );
  await page.screenshot({ path: "tmp/desktop-home.png", fullPage: true });
  await page
    .getByRole("textbox", { name: "搜索公司、城市或岗位" })
    .fill("森屿");
  await page.getByRole("button", { name: "搜索公司" }).click();
  await expect(
    page.getByRole("heading", { name: "发现 1 家公司" }),
  ).toBeVisible();
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "森屿科技" }) })
    .click();
  await expect(
    page.getByRole("heading", { name: "工作与生活，数据告诉你" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "收藏公司" }).click();
  await expect(page.getByRole("status")).toContainText("演示模式");
  await page.goto("/companies?q=不存在的公司");
  await expect(
    page.getByRole("heading", { name: "暂时没有找到匹配的公司" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/companies",
    "/company/senyu",
    "/rankings",
    "/reviews/new",
    "/login",
    "/me",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `Horizontal overflow at ${route}`,
    ).toBeTruthy();
    await expect(page.locator(".mobile-nav")).toBeVisible();
  }
  await page.goto("/");
  await page.screenshot({ path: "tmp/mobile-home.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("review validation and demo write response", async ({ page }) => {
  await page.goto("/reviews/new");
  test.skip(
    (await page.locator(".demo-banner").count()) === 0,
    "避免向真实数据库写入测试评价",
  );
  await page
    .getByLabel("我确认分享来自亲身经历，不包含他人隐私或人身攻击。")
    .check();
  await page.getByRole("button", { name: "提交匿名评价" }).click();
  await expect(page.getByText("优点至少填写 10 个字")).toBeVisible();
  await page
    .getByLabel("值得肯定的地方 *")
    .fill("团队氛围很好，沟通顺畅，基本可以按时下班。");
  await page
    .getByLabel("有待改善的地方 *")
    .fill("希望跨团队合作流程更加顺畅，减少不必要的会议。");
  await page.getByRole("button", { name: "提交匿名评价" }).click();
  await expect(page.getByRole("status")).toContainText("内容未提交");
});

test("small phone and tablet layouts stay within the viewport", async ({
  page,
}) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/companies",
      "/company/senyu",
      "/rankings",
      "/reviews/new",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px ${route}`,
      ).toBeTruthy();
    }
  }
});
