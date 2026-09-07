import { Button } from "@/components/ui/button";
import Link from "next/link";
import { currentUser, isAdmin } from "@/lib/auth";
import { db } from "@/db";
import * as s from "@/db/schema";
import { Moderate } from "@/components/interactions";
export const metadata = {
  title: "审核后台",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const user = await currentUser();
  if (!user || !isAdmin(user.id) || !db)
    return (
      <div className="container page-space empty-state">
        <h1>审核后台</h1>
        <p>此页面仅对已配置的管理员账号开放。</p>
        <Button asChild>
          <Link href="/login">登录管理员账号</Link>
        </Button>
      </div>
    );
  const [reviews, submissions, comments, reports] = await Promise.all([
    db.select().from(s.reviews),
    db.select().from(s.submissions),
    db.select().from(s.comments),
    db.select().from(s.reports),
  ]);
  const groups = [
    {
      table: "reviews",
      title: "评价审核",
      rows: reviews.map((r) => ({
        id: r.id,
        status: r.status,
        content: `${r.data.pros} / ${r.data.cons} / ${r.data.content}`,
      })),
    },
    {
      table: "submissions",
      title: "公司投稿",
      rows: submissions.map((r) => ({
        ...r,
        content: `${r.name} · ${r.city} · ${r.description}`,
      })),
    },
    { table: "comments", title: "回复审核", rows: comments },
    { table: "reports", title: "举报处理", rows: reports },
  ];
  return (
    <div className="container page-space">
      <h1>内容审核</h1>
      {groups.map((g) => (
        <section key={g.table}>
          <h2 className="spaced">{g.title}</h2>
          {g.rows.map((r) => (
            <div className="panel" key={r.id}>
              <span className="tag">{r.status}</span>
              <p>{r.content}</p>
              <Moderate id={r.id} table={g.table} />
            </div>
          ))}
          {!g.rows.length && <p className="muted">暂无待处理内容</p>}
        </section>
      ))}
    </div>
  );
}
