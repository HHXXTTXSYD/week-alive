import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getCatalog } from "@/db/queries";
import { db } from "@/db";
import { favorites, comments } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { policies, statistics } from "@/lib/domain";
import { CompanyLogo } from "@/components/company-card";
import { ActionButton } from "@/components/interactions";
import { ReviewCard } from "@/components/review-card";
import { WorkChart } from "@/components/work-chart";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { companies } = await getCatalog();
  const c = companies.find((c) => c.slug === slug);
  return { title: c ? `${c.name}双休吗？加班情况与员工评价` : "公司未找到" };
}
export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ city?: string; job?: string; period?: string }>;
}) {
  const [{ slug }, p, { companies, reviews }, user] = await Promise.all([
    params,
    searchParams,
    getCatalog(),
    currentUser(),
  ]);
  const company = companies.find((c) => c.slug === slug);
  if (!company) notFound();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - Number(p.period || 12));
  const scoped = reviews.filter(
    (r) =>
      r.companyId === company.id &&
      (!p.city || r.city === p.city) &&
      (!p.job || r.job === p.job) &&
      (p.period === "all" || new Date(r.createdAt) >= cutoff),
  );
  const stats = statistics(scoped);
  const saved =
    db && user
      ? await db
          .select()
          .from(favorites)
          .where(
            and(
              eq(favorites.userId, user.id),
              eq(favorites.companyId, company.id),
            ),
          )
      : [];
  const replies = db
    ? await db.select().from(comments).where(eq(comments.status, "published"))
    : [];
  return (
    <div className="container page-space">
      <div className="breadcrumb">
        <Link href="/companies">公司库</Link> / {company.name}
      </div>
      <section className="company-header panel">
        <CompanyLogo company={company} />
        <div>
          <h1>{company.name}</h1>
          <p>
            {company.cities.join(" · ")}　/　{company.industry}　/　
            {company.size}
          </p>
        </div>
        <div className="actions">
          <ActionButton
            kind="favorite"
            id={company.id}
            initial={saved.length > 0}
          />
          <Button asChild>
            <Link href={`/reviews/new?company=${company.id}`}>
              分享工作体验
            </Link>
          </Button>
        </div>
      </section>
      <form className="detail-filter">
        <Label>
          办公城市
          <NativeSelect name="city" defaultValue={p.city || ""}>
            <NativeSelectOption value="">全部城市</NativeSelectOption>
            {company.cities.map((c) => (
              <NativeSelectOption key={c}>{c}</NativeSelectOption>
            ))}
          </NativeSelect>
        </Label>
        <Label>
          岗位
          <NativeSelect name="job" defaultValue={p.job || ""}>
            <NativeSelectOption value="">全部岗位</NativeSelectOption>
            {[
              ...new Set(
                reviews
                  .filter((r) => r.companyId === company.id)
                  .map((r) => r.job),
              ),
            ].map((j) => (
              <NativeSelectOption key={j}>{j}</NativeSelectOption>
            ))}
          </NativeSelect>
        </Label>
        <Label>
          统计时间
          <NativeSelect name="period" defaultValue={p.period || "12"}>
            <NativeSelectOption value="3">近3个月</NativeSelectOption>
            <NativeSelectOption value="6">近半年</NativeSelectOption>
            <NativeSelectOption value="12">近1年</NativeSelectOption>
            <NativeSelectOption value="all">全部时间</NativeSelectOption>
          </NativeSelect>
        </Label>
        <Button variant="outline">更新统计</Button>
      </form>
      <div className="detail-grid">
        <div>
          <section className="panel">
            <div className="section-heading">
              <h2>工作与生活，数据告诉你</h2>
              <span className="tag green">可信度：{stats.confidence}</span>
            </div>
            <div className="metric-grid">
              {[
                [
                  "正常双休率",
                  stats.rate === null ? "样本不足" : `${stats.rate}%`,
                ],
                [
                  "双休友好度",
                  stats.friendliness === null
                    ? "—"
                    : `${stats.friendliness} / 100`,
                ],
                [
                  "平均下班时间",
                  stats.offTime === "—" ? "—" : `约 ${stats.offTime}`,
                ],
                [
                  "周末加班反馈",
                  stats.overtime === null ? "—" : `${stats.overtime}%`,
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="policy-bars">
              {policies.map((policy) => {
                const n = scoped.filter((r) => r.policy === policy).length;
                return (
                  <div key={policy}>
                    <span>{policy}</span>
                    <div className="progress">
                      <i
                        style={{
                          width: `${stats.count ? (n / stats.count) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <b>{n} 条</b>
                  </div>
                );
              })}
            </div>
            <p className="data-note">
              基于 {stats.count} 条已发布反馈 · 最近更新{" "}
              {scoped.length
                ? scoped
                    .map((r) => r.createdAt)
                    .sort()
                    .at(-1)
                    ?.slice(0, 10)
                : "暂无"}
              <br />
              不足 3 条反馈不作统计结论；下班时间根据区间估算。
            </p>
          </section>
          <section className="panel">
            <h2>大家通常几点下班？</h2>
            <p className="muted">分布比平均数，更接近每个人的日常。</p>
            <WorkChart data={stats.distribution} />
          </section>
          <div className="section-heading">
            <h2>
              员工工作体验 <small>{stats.count}</small>
            </h2>
            <Link href={`/reviews/new?company=${company.id}`}>
              写一条评价 →
            </Link>
          </div>
          {scoped.length ? (
            scoped
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((r) => (
                <div key={r.id}>
                  <ReviewCard review={r} />
                  {replies
                    .filter((c) => c.reviewId === r.id)
                    .map((c) => (
                      <div className="reply" key={c.id}>
                        <strong>匿名回复</strong>
                        <p>{c.content}</p>
                      </div>
                    ))}
                </div>
              ))
          ) : (
            <div className="empty-state">
              这个筛选范围还没有反馈，期待你的第一份分享。
            </div>
          )}
        </div>
        <aside>
          <section className="panel">
            <h3>关于 {company.name}</h3>
            <p className="muted leading">{company.description}</p>
            {company.website && /^https?:\/\//.test(company.website) && (
              <a
                className="text-link"
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                访问公司官网 ↗
              </a>
            )}
          </section>
          <section className="panel">
            <h3>综合体验评分</h3>
            <p className="overall-score">
              {stats.score}
              <small> / 10</small>
            </p>
            <p className="muted">
              来自工作生活平衡、薪资、团队、管理与成长五项评分。
            </p>
          </section>
          <div className="notice">
            <h3>每个人的体验，都有上下文</h3>
            <p>
              同一公司不同团队可能差异很大。建议结合城市、岗位和反馈时间综合判断。
            </p>
            <Link href="/about">了解统计方式 →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
