import Link from "next/link";
import { Trophy } from "lucide-react";
import { getCatalog } from "@/db/queries";
import { cities, statistics } from "@/lib/domain";
import { CompanyLogo } from "@/components/company-card";
export const metadata = { title: "真双休公司榜" };
export default async function Rankings({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const { companies, reviews } = await getCatalog();
  const rows = companies
    .filter((c) => !city || c.cities.includes(city))
    .map((company) => ({
      company,
      stats: statistics(
        reviews.filter(
          (r) => r.companyId === company.id && (!city || r.city === city),
        ),
      ),
    }))
    .filter((r) => r.stats.rate !== null)
    .sort(
      (a, b) => b.stats.rate! - a.stats.rate! || b.stats.count - a.stats.count,
    );
  return (
    <div className="container page-space">
      <div className="rank-hero">
        <span className="eyebrow">
          <Trophy size={16} /> THE WEEKEND LIST
        </span>
        <h1>真双休公司榜</h1>
        <p>把周末留给生活，让好的工作被更多人发现。</p>
      </div>
      <div className="city-tabs">
        <Link className={!city ? "active" : ""} href="/rankings">
          全国
        </Link>
        {cities.map((c) => (
          <Link
            className={city === c ? "active" : ""}
            href={`/rankings?city=${c}`}
            key={c}
          >
            {c}
          </Link>
        ))}
      </div>
      <div className="ranking-table">
        <div className="ranking-row table-head">
          <span>排名</span>
          <span>公司</span>
          <span>正常双休率</span>
          <span>平均下班</span>
          <span>反馈样本</span>
        </div>
        {rows.map(({ company, stats }, i) => (
          <Link
            className="ranking-row"
            key={company.id}
            href={`/company/${company.slug}${city ? `?city=${city}` : ""}`}
          >
            <span className={`rank-number rank-${i + 1}`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="rank-company">
              <CompanyLogo company={company} />
              <div>
                <h3>{company.name}</h3>
                <p>
                  {company.industry} · {company.cities.join(" / ")}
                </p>
              </div>
            </div>
            <strong className="rank-rate">{stats.rate}%</strong>
            <span className="rank-time">约 {stats.offTime}</span>
            <span>{stats.count} 条</span>
          </Link>
        ))}
        {!rows.length && (
          <div className="empty-state">暂时没有满足样本要求的公司。</div>
        )}
      </div>
      <p className="data-note">
        按正常双休率排序，同分时优先展示样本较多的公司。至少 3
        条已发布反馈才能上榜，少量样本的结果仅供参考。
      </p>
    </div>
  );
}
