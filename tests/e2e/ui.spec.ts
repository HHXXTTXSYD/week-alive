import { test, expect } from "@playwright/test";

test("responsive shadcn pages and account tabs", async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of [
      "/",
      "/login",
      "/companies",
      "/rankings",
      "/reviews/new",
      "/companies/submit",
      "/me",
    ]) {
      await page.goto(route);
      await expect(page.locator("h1").first()).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px: ${route}`,
      ).toBeTruthy();
      if (
        (width === 1440 || width === 390) &&
        (route === "/" || route === "/login")
      ) {
        await page.screenshot({
          path: `tmp/modern-${route === "/" ? "home" : "login"}-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  expect(
    errors,
    "No hydration or script errors before tab interaction",
  ).toEqual([]);
  const signup = page.getByRole("tab", { name: "注册" });
  await signup.click();
  await expect(signup).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: "创建账号" })).toBeVisible();
  await expect(page.getByLabel("邮箱", { exact: true })).toBeVisible();
  await expect(page.getByLabel("密码", { exact: true })).toHaveAttribute(
    "autocomplete",
    "new-password",
  );
  await signup.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "登录" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("button", { name: "登录账号" })).toBeVisible();
  await page.goto("/companies");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("办公城市").selectOption("北京");
  await page.getByRole("button", { name: "应用筛选" }).click();
  await expect(page).toHaveURL(/city=%E5%8C%97%E4%BA%AC/);
  expect(errors).toEqual([]);
});
