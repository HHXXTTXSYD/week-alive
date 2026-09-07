import { test, expect } from "@playwright/test";

test("failed registration preserves inputs and can be retried without contacting auth", async ({
  page,
}) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  let attempts = 0;
  await page.route("**/login", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    attempts++;
    await route.fulfill({
      contentType: "text/x-component",
      body: '0:{"a":"$@1","f":"","b":"test"}\n1:{"ok":false,"message":"验证邮件发送已达上限，请稍后再试。"}\n',
    });
  });
  await page.getByRole("tab", { name: "注册" }).click();
  const email = page.getByLabel("邮箱", { exact: true });
  const password = page.getByLabel("密码", { exact: true });
  await email.fill("registration-test@example.com");
  await password.fill("Test-password-123!");
  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.getByRole("button", { name: "创建账号" }).click();
    await expect(page.getByRole("status")).toContainText(
      "验证邮件发送已达上限",
    );
    await expect(email).toHaveValue("registration-test@example.com");
    await expect(password).toHaveValue("Test-password-123!");
    expect(attempts).toBe(attempt);
  }
  await page.getByRole("tab", { name: "登录" }).click();
  await expect(page.locator(".form-status")).toBeEmpty();
});
