import { test } from "node:test";
import assert from "node:assert/strict";
import { authErrorMessage } from "../src/lib/auth-error";

test("email delivery restrictions point to configuration instead of invalid credentials", () => {
  assert.match(
    authErrorMessage("email_address_not_authorized", "signup"),
    /管理员.*邮件服务配置/,
  );
  assert.match(
    authErrorMessage("over_email_send_rate_limit", "signup"),
    /发送已达上限/,
  );
  assert.match(
    authErrorMessage("email_not_confirmed", "login"),
    /先点击验证邮件/,
  );
});

test("unknown provider errors use a safe fallback", () => {
  assert.match(
    authErrorMessage("unexpected_failure", "signup"),
    /注册服务暂时不可用/,
  );
  assert.equal(authErrorMessage(undefined, "login"), "登录失败，请稍后重试。");
});
