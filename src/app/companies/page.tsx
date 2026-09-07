import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Building2, SlidersHorizontal } from "lucide-react";
import { getCatalog } from "@/db/queries";
import { cities, jobs, policies, statistics, times } from "@/lib/domain";
import { CompanyCard } from "@/components/company-card";
import { SearchForm } from "@/components/search";
export const metadata = { title: "公司库" };
export default async function Companies({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const { companies, reviews } = await getCatalog();
  const filtered = companies
    .map((company) => {
      const scoped = reviews.filter(
        (r) =>
          r.companyId === company.id &&
          (!p.city || r.city === p.city) &&
          (!p.job || r.job === p.job),
      );
      return { company, stats: statistics(scoped), scoped };
    })
    .filter(({ company, stats, scoped }) => {
      const query = (p.q || "")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      return (
        query.every((q) =>
          [
            company.name,
            company.industry,
            ...company.cities,
            ...scoped.map((r) => r.job),
          ]
            .join(" ")
            .toLowerCase()
            .includes(q),
        ) &&
        (!p.city || company.cities.includes(p.city)) &&
        (!p.industry || company.industry === p.industry) &&
        (!p.job || scoped.length > 0) &&
        (!p.policy || scoped.some((r) => r.policy === p.policy)) &&
        (!p.time ||
          (stats.count >= 3 &&
            scoped.reduce((s, r) => s + 17.5 + times.indexOf(r.offTime), 0) /
              scoped.length <
              Number(p.time)))
      );
    })
    .sort((a, b) =>
      p.sort === "reviews"
        ? b.stats.count - a.stats.count
        : (b.stats.rate ?? -1) - (a.stats.rate ?? -1),
    );
  return (
    <div className="container page-space">
      <div className="page-heading">
        <span className="section-kicker">EXPLORE COMPANIES</span>
        <h1>下一份工作，认真选。</h1>
        <p>了解公司的另一面，找到适合自己的工作节奏。</p>
      </div>
      <SearchForm initial={p.q} />
      <form className="filter-panel" action="/companies">
        <input type="hidden" name="q" value={p.q || ""} />
        <div className="filter-title">
          <SlidersHorizontal size={17} /> 筛选公司{" "}
          <Link href="/companies">重置筛选</Link>
        </div>
        <div className="filter-fields">
          {[
            { name: "city", label: "办公城市", options: cities },
            {
              name: "industry",
              label: "所属行业",
              options: [...new Set(companies.map((c) => c.industry))],
            },
            { name: "job", label: "工作岗位", options: jobs },
            { name: "policy", label: "工作制度", options: [...policies] },
            { name: "time", label: "平均下班", options: ["19", "20", "21"] },
          ].map((f) => (
            <Label key={f.name}>
              {f.label}
              <NativeSelect name={f.name} defaultValue={p[f.name] || ""}>
                <NativeSelectOption value="">不限</NativeSelectOption>
                {f.options.map((v) => (
                  <NativeSelectOption key={v} value={v}>
                    {f.name === "time" ? `${v}点前` : v}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Label>
          ))}
          <Button>应用筛选</Button>
        </div>
        <Label className="sort-field">
          排序方式{" "}
          <NativeSelect name="sort" defaultValue={p.sort || "rate"}>
            <NativeSelectOption value="rate">双休率优先</NativeSelectOption>
            <NativeSelectOption value="reviews">
              反馈数量优先
            </NativeSelectOption>
          </NativeSelect>
        </Label>
      </form>
      <div className="results-heading">
        <h2>发现 {filtered.length} 家公司</h2>
        <span>统计范围随城市、岗位筛选变化</span>
      </div>
      {filtered.length ? (
        <div className="company-grid">
          {filtered.map((item) => (
            <CompanyCard key={item.company.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Building2 size={36} />
          <h2>暂时没有找到匹配的公司</h2>
          <p>试试减少筛选条件，或补充一家你了解的公司。</p>
          <Button asChild>
            <Link href="/companies/submit">提交公司</Link>
          </Button>
        </div>
      )}
      <div className="submit-banner">
        <div>
          <h3>没有找到你的公司？</h3>
          <p>一起补全这份工作生活指南。</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/companies/submit">＋ 补充公司</Link>
        </Button>
      </div>
    </div>
  );
}
