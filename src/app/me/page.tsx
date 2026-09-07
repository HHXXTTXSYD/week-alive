import { Button } from "@/components/ui/button";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { UserRound } from "lucide-react";
import { currentUser, isAdmin } from "@/lib/auth";
import { signOut } from "@/actions/mutations";
import { db } from "@/db";
import * as s from "@/db/schema";
import { getCatalog } from "@/db/queries";
import { CompanyCard } from "@/components/company-card";
import { statistics } from "@/lib/domain";
export const metadata = { title: "我的" };
export default async function Me() {
  const user = await currentUser();
  if (!user)
    return (
      <div className="container narrow page-space">
        <section className="empty-state">
          <UserRound size={45} />
          <h1>给自己的下一步，留个位置。</h1>
          <p>登录后收藏心仪公司，查看你的评价与审核进度。</p>
          <Button asChild>
            <Link href="/login">登录 / 注册</Link>
          </Button>
        </section>
      </div>
    );
  const [{ companies, reviews }, mine, saved] = await Promise.all([
    getCatalog(),
    db ? db.select().from(s.reviews).where(eq(s.reviews.userId, user.id)) : [],
    db
      ? db.select().from(s.favorites).where(eq(s.favorites.userId, user.id))
      : [],
  ]);
  return (
    <div className="container page-space">
      <section className="panel profile">
        <span className="avatar">
          <UserRound />
        </span>
        <div>
          <h1>我的工作生活指南</h1>
          <p>{user.email}</p>
        </div>
        <form action={signOut}>
          <Button variant="outline">退出登录</Button>
        </form>
        {isAdmin(user.id) && <Link href="/admin">审核后台 →</Link>}
      </section>
      <h2 className="spaced">我的收藏 · {saved.length}</h2>
      <div className="company-grid">
        {companies
          .filter((c) => saved.some((f) => f.companyId === c.id))
          .map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              stats={statistics(
                reviews.filter((r) => r.companyId === company.id),
              )}
            />
          ))}
      </div>
      {!saved.length && (
        <p className="empty-state">还没有收藏，去公司库逛逛吧。</p>
      )}
      <h2 className="spaced">我的评价 · {mine.length}</h2>
      {mine.map((r) => (
        <article className="panel" key={r.id}>
          <h3>
            {companies.find((c) => c.id === r.companyId)?.name}
            <span className="tag">
              {
                (
                  {
                    pending: "待审核",
                    published: "已发布",
                    rejected: "未通过",
                    hidden: "已隐藏",
                  } as Record<string, string>
                )[r.status]
              }
            </span>
          </h3>
          <p>{r.data.pros}</p>
          <small>{r.createdAt.toISOString().slice(0, 10)}</small>
        </article>
      ))}
      {!mine.length && (
        <p className="empty-state">还没有评价，分享一份你的工作体验吧。</p>
      )}
    </div>
  );
}
