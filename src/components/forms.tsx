"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authenticate, mutate } from "@/actions/mutations";
import {
  Company,
  ReviewInput,
  reviewSchema,
  policies,
  times,
  frequencies,
  jobs,
} from "@/lib/domain";
export function ReviewForm({
  companies,
  selected,
}: {
  companies: Company[];
  selected?: string;
}) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const initialCompany = companies.find((c) => c.id === selected) || companies[0];
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    resetField,
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      companyId: initialCompany?.id || "",
      city: initialCompany?.cities[0] || "",
      job: jobs[0],
      employment: "在职",
      policy: policies[0],
      offTime: times[1],
      overtime: frequencies[0],
      messages: "基本不需要",
      wlb: 4,
      salary: 4,
      team: 4,
      management: 4,
      growth: 4,
      content: "",
    },
  });
  const company = companies.find((c) => c.id === watch("companyId"));
  const select = (
    name: keyof ReviewInput,
    label: string,
    options: readonly string[],
  ) => (
    <Label key={name}>
      {label}
      <NativeSelect {...register(name)} disabled={!options.length}>
        {!options.length && (
          <NativeSelectOption value="">暂无可选城市</NativeSelectOption>
        )}
        {options.map((o) => (
          <NativeSelectOption key={o}>{o}</NativeSelectOption>
        ))}
      </NativeSelect>
    </Label>
  );
  return (
    <form
      className="review-form"
      onSubmit={handleSubmit((data) =>
        start(async () => setMessage((await mutate("review", data)).message)),
      )}
    >
      <section className="panel">
        <h2>
          <i>01</i> 你的工作背景
        </h2>
        <div className="form-grid">
          <Label>
            公司
            <NativeSelect
              {...register("companyId", {
                onChange: (e) =>
                  resetField("city", {
                    defaultValue: companies.find((c) => c.id === e.target.value)
                      ?.cities[0] || "",
                  }),
              })}
              disabled={!companies.length}
            >
              {!companies.length && (
                <NativeSelectOption value="">暂无可选公司</NativeSelectOption>
              )}
              {companies.map((c) => (
                <NativeSelectOption value={c.id} key={c.id}>
                  {c.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Label>
          {select("city", "办公城市", company?.cities || [])}
          {select("job", "工作岗位", jobs)}
          {select("employment", "在职状态", ["在职", "已离职", "实习"])}
        </div>
        {!companies.length ? (
          <p className="muted" role="status">
            暂无可评价的公司，请先<Link href="/companies/submit">补充公司</Link>，审核通过后再来分享体验。
          </p>
        ) : !company?.cities.length ? (
          <p className="muted" role="status">
            该公司暂未配置办公城市，暂时无法提交评价。
          </p>
        ) : null}
      </section>
      <section className="panel">
        <h2>
          <i>02</i> 工作与休息
        </h2>
        <div className="form-grid">
          {select("policy", "实际工作制度", policies)}
          {select("offTime", "通常下班时间", times)}
          {select("overtime", "周末加班频率", frequencies)}
          {select("messages", "周末回复工作消息", [
            "基本不需要",
            "偶尔",
            "经常",
          ])}
        </div>
      </section>
      <section className="panel">
        <h2>
          <i>03</i> 给工作体验打个分
        </h2>
        <p className="muted">1 分代表不满意，5 分代表非常满意。</p>
        <div className="rating-fields">
          {(["wlb", "salary", "team", "management", "growth"] as const).map(
            (key, i) => (
              <Label key={key}>
                {
                  [
                    "工作生活平衡",
                    "薪资待遇",
                    "团队氛围",
                    "管理体验",
                    "成长空间",
                  ][i]
                }
                <NativeSelect {...register(key, { valueAsNumber: true })}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <NativeSelectOption key={n} value={n}>
                      {"★".repeat(n)}　{n} 分
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Label>
            ),
          )}
        </div>
      </section>
      <section className="panel">
        <h2>
          <i>04</i> 多说一点你的体验
        </h2>
        {(["pros", "cons", "content"] as const).map((key, i) => (
          <Label className="textarea-label" key={key}>
            {
              ["值得肯定的地方 *", "有待改善的地方 *", "其他想分享的（选填）"][
                i
              ]
            }
            <Textarea
              {...register(key)}
              rows={3}
              placeholder={
                [
                  "有哪些让你愿意留下来的地方？至少 10 字",
                  "客观描述你亲历的情况。至少 10 字",
                  "分享具体工作感受，请勿填写个人隐私信息",
                ][i]
              }
            />
            {errors[key] && (
              <span className="error-text">{errors[key]?.message}</span>
            )}
          </Label>
        ))}
      </section>
      <Label className="agreement">
        <input type="checkbox" required />{" "}
        我确认分享来自亲身经历，不包含他人隐私或人身攻击。
      </Label>
      <p className="muted">评价将匿名展示，审核通过后计入公开统计。</p>
      {Object.keys(errors).some(
        (k) => !["pros", "cons", "content"].includes(k),
      ) && <p className="error-text">请检查公司、城市和工作信息是否完整。</p>}
      <Button className="wide" disabled={pending || !company?.cities.length}>
        {pending ? "正在提交…" : "提交匿名评价"}
      </Button>
      <p className="form-status" role="status">
        {message}
      </p>
    </form>
  );
}
export function LoginForm() {
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Tabs
      value={mode}
      onValueChange={(value) => {
        setMode(value);
        setMessage("");
      }}
    >
      <TabsList className="auth-tabs" aria-label="账号操作">
        <TabsTrigger value="login">登录</TabsTrigger>
        <TabsTrigger value="signup">注册</TabsTrigger>
      </TabsList>
      <TabsContent value={mode}>
        <form
          action={(form) =>
            start(async () => {
              const result = await authenticate(mode, form);
              setMessage(result.message);
              if (result.ok && mode === "login") {
                router.push("/me");
                router.refresh();
              }
            })
          }
        >
          <Label>
            邮箱
            <Input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </Label>
          <Label>
            密码
            <Input
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="至少 8 位字符"
            />
          </Label>
          <Button className="wide" disabled={pending}>
            {pending ? "处理中…" : mode === "login" ? "登录账号" : "创建账号"}
          </Button>
          <p role="status" className="form-status">
            {message}
          </p>
        </form>
      </TabsContent>
    </Tabs>
  );
}
export function SubmissionForm() {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="panel"
      action={(form) =>
        start(async () =>
          setMessage(
            (await mutate("submission", Object.fromEntries(form))).message,
          ),
        )
      }
    >
      {[
        ["name", "公司名称", "text"],
        ["city", "办公城市", "text"],
        ["website", "公司官网（选填）", "url"],
      ].map(([name, label, type]) => (
        <Label key={name}>
          {label}
          <Input
            name={name}
            type={type}
            required={name !== "website"}
            maxLength={name === "city" ? 40 : 100}
          />
        </Label>
      ))}
      <Label>
        公司简介
        <Textarea
          name="description"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="简单介绍业务、行业和规模，至少 10 字"
        />
      </Label>
      <p className="muted">提交后由管理员审核，审核通过后收录到公司库。</p>
      <Button className="wide" disabled={pending}>
        {pending ? "提交中…" : "提交公司资料"}
      </Button>
      <p role="status">{message}</p>
    </form>
  );
}
