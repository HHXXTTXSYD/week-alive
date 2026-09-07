export function authErrorMessage(code: string | undefined, mode: string) {
  switch (code) {
    case "email_address_not_authorized":
      return "暂时无法向此邮箱发送验证邮件，请联系网站管理员检查邮件服务配置。";
    case "over_email_send_rate_limit":
      return "验证邮件发送已达上限，请稍后再试。";
    case "over_request_rate_limit":
      return "操作过于频繁，请稍后再试。";
    case "email_address_invalid":
      return "邮箱地址无效，请检查后重试。";
    case "weak_password":
      return "密码未满足安全要求，请使用更长且包含大小写字母、数字和符号的密码。";
    case "email_not_confirmed":
      return "邮箱尚未验证，请先点击验证邮件中的链接，再登录。";
    case "signup_disabled":
    case "email_provider_disabled":
      return "邮箱登录或注册暂未开放，请联系网站管理员。";
    case "email_exists":
    case "user_already_exists":
      return "此邮箱已注册，请切换到登录。";
    case "invalid_credentials":
      return "登录失败，请检查邮箱和密码。";
    default:
      return mode === "signup"
        ? "注册服务暂时不可用，请稍后重试；若持续失败，请联系网站管理员。"
        : "登录失败，请稍后重试。";
  }
}
