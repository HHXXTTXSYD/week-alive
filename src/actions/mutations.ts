"use server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import * as s from "@/db/schema";
import { requireUser, isAdmin, authClient } from "@/lib/auth";
import { reviewSchema } from "@/lib/domain";
import { ActionError } from "@/lib/action-error";
import { authErrorMessage } from "@/lib/auth-error";
export async function mutate(
  kind: string,
  payload: unknown,
): Promise<{ ok: boolean; message: string }> {
  try {
    if (!db)
      return {
        ok: false,
        message: "当前为演示模式，尚未连接数据库，内容未提交。",
      };
    const user = await requireUser();
    if (kind === "review") {
      const data = reviewSchema.parse(payload);
      const location = await db
        .select()
        .from(s.locations)
        .where(
          and(
            eq(s.locations.companyId, data.companyId),
            eq(s.locations.city, data.city),
          ),
        );
      if (!location.length) throw new ActionError("请选择该公司的有效办公城市");
      await db
        .insert(s.reviews)
        .values({ companyId: data.companyId, userId: user.id, data });
    } else if (kind === "favorite" || kind === "vote") {
      const { id } = z.object({ id: z.string().uuid() }).parse(payload);
      if (kind === "favorite") {
        const condition = and(
          eq(s.favorites.companyId, id),
          eq(s.favorites.userId, user.id),
        );
        const existing = await db.select().from(s.favorites).where(condition);
        if (existing.length) await db.delete(s.favorites).where(condition);
        else
          await db
            .insert(s.favorites)
            .values({ companyId: id, userId: user.id })
            .onConflictDoNothing();
      } else {
        const published = await db
          .select()
          .from(s.reviews)
          .where(and(eq(s.reviews.id, id), eq(s.reviews.status, "published")));
        if (!published.length) throw new ActionError("评价不存在");
        await db
          .insert(s.votes)
          .values({ reviewId: id, userId: user.id })
          .onConflictDoNothing();
      }
    } else if (kind === "comment" || kind === "report") {
      const data = z
        .object({
          id: z.string().uuid(),
          content: z.string().trim().min(5).max(1000),
        })
        .parse(payload);
      const published = await db
        .select()
        .from(s.reviews)
        .where(
          and(eq(s.reviews.id, data.id), eq(s.reviews.status, "published")),
        );
      if (!published.length) throw new ActionError("评价不存在");
      await db
        .insert(kind === "comment" ? s.comments : s.reports)
        .values({ reviewId: data.id, userId: user.id, content: data.content });
    } else if (kind === "submission") {
      const data = z
        .object({
          name: z.string().trim().min(2).max(100),
          city: z.string().min(2).max(40),
          website: z.union([z.literal(""), z.url()]),
          description: z.string().trim().min(10).max(2000),
        })
        .parse(payload);
      await db.insert(s.submissions).values({ ...data, userId: user.id });
    } else if (kind === "moderate") {
      if (!isAdmin(user.id)) throw new ActionError("无管理员权限");
      const data = z
        .object({
          id: z.string().uuid(),
          table: z.enum(["reviews", "comments", "reports", "submissions"]),
          status: z.enum(["published", "rejected", "hidden"]),
        })
        .parse(payload);
      if (data.table === "submissions" && data.status === "published") {
        await db.transaction(async (tx) => {
          const [entry] = await tx
            .select()
            .from(s.submissions)
            .where(eq(s.submissions.id, data.id))
            .for("update");
          if (!entry || entry.status !== "pending")
            throw new ActionError("投稿已处理");
          const [company] = await tx
            .insert(s.companies)
            .values({
              name: entry.name,
              slug: `company-${entry.id}`,
              industry: "待补充",
              size: "待补充",
              description: entry.description,
              website: entry.website,
            })
            .returning();
          await tx
            .insert(s.locations)
            .values({ companyId: company.id, city: entry.city });
          await tx
            .update(s.submissions)
            .set({ status: "published" })
            .where(eq(s.submissions.id, data.id));
        });
      } else
        await db
          .update(s[data.table])
          .set({ status: data.status })
          .where(eq(s[data.table].id, data.id));
    } else throw new ActionError("不支持的操作");
    revalidatePath("/", "layout");
    return {
      ok: true,
      message:
        kind === "favorite"
          ? "收藏状态已更新"
          : kind === "vote"
            ? "感谢你的反馈"
            : kind === "moderate"
              ? "审核结果已保存"
              : "已提交，审核通过后公开展示。",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof z.ZodError
          ? "请检查填写内容是否完整、格式是否正确"
          : error instanceof ActionError
            ? error.message
            : "提交失败，请稍后重试",
    };
  }
}
export async function authenticate(mode: string, form: FormData) {
  const client = await authClient();
  if (!client)
    return {
      ok: false,
      message: "当前为演示模式，请配置 Supabase 后使用登录注册。",
    };
  const parsed = z
    .object({
      email: z.string().trim().pipe(z.email()),
      password: z.string().min(8),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { ok: false, message: "请输入有效邮箱和至少 8 位密码" };
  const result =
    mode === "signup"
      ? await client.auth.signUp(parsed.data)
      : await client.auth.signInWithPassword(parsed.data);
  if (result.error) {
    console.error("Authentication failed", {
      mode,
      code: result.error.code,
      status: result.error.status,
    });
    return {
      ok: false,
      message: authErrorMessage(result.error.code, mode),
    };
  }
  revalidatePath("/", "layout");
  return {
    ok: true,
    authenticated: Boolean(result.data.session),
    message: result.data.session
      ? "登录成功"
      : "请查看邮箱完成验证；如果已有账号，请直接登录。",
  };
}
export async function signOut() {
  const client = await authClient();
  await client?.auth.signOut();
  revalidatePath("/", "layout");
}
