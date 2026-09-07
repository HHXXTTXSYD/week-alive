import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Company, statistics } from "@/lib/domain";
import { Card } from "@/components/ui/card";
export function CompanyLogo({ company }: { company: Company }) {
  return (
    <span className="company-logo" style={{ background: company.color }}>
      {company.mark}
    </span>
  );
}
export function CompanyCard({
  company,
  stats,
}: {
  company: Company;
  stats: ReturnType<typeof statistics>;
}) {
  return (
    <Link href={`/company/${company.slug}`}>
      <Card className="company-card">
        <div className="card-top">
          <CompanyLogo company={company} />
          <div>
            <h3>{company.name}</h3>
            <p>
              {company.industry} <span>·</span> {company.size}
            </p>
          </div>
          <ArrowUpRight className="card-arrow" size={19} />
        </div>
        <p className="location">
          <MapPin size={13} />
          {company.cities.join(" · ")}
        </p>
        <div className="card-stat">
          <span>
            正常双休率 <ShieldCheck size={14} />
          </span>
          <strong>
            {stats.rate === null ? (
              "样本不足"
            ) : (
              <>
                {stats.rate}
                <small>%</small>
              </>
            )}
          </strong>
        </div>
        <div className="progress">
          <i style={{ width: `${stats.rate ?? 0}%` }} />
        </div>
        <div className="card-bottom">
          <span>
            <Clock3 size={14} /> 约 {stats.offTime} 下班
          </span>
          <span>
            <MessageSquare size={14} />
            {stats.count} 条反馈
          </span>
        </div>
      </Card>
    </Link>
  );
}
