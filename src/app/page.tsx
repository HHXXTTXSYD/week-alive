import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Clock3,
  Compass,
  MessageSquare,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { getCatalog } from "@/db/queries";
import { statistics } from "@/lib/domain";
import { CompanyCard } from "@/components/company-card";
import { ReviewCard } from "@/components/review-card";
import { SearchForm } from "@/components/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function Home() {
  const { companies, reviews } = await getCatalog();
  const ranked = companies
    .map((company) => ({
      company,
      stats: statistics(reviews.filter((r) => r.companyId === company.id)),
    }))
    .sort((a, b) => (b.stats.rate ?? -1) - (a.stats.rate ?? -1));
  const latest = [...reviews]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 2);
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker">
              工作生活指南 <span> / </span> 给下班后的你
            </div>
            <h1>
              好工作，
              <br />
              也该有<span>好周末。</span>
            </h1>
            <p>
              双休不是福利，是生活的起点。
              <br />
              从员工的真实体验，看见招聘信息之外的日常。
            </p>
            <SearchForm large />
            <div className="hot-search">
              <span>热门城市</span>
              {["北京", "上海", "深圳", "杭州", "武汉", "成都"].map((city) => (
                <Link href={`/companies?city=${city}`} key={city}>
                  {city}
                </Link>
              ))}
            </div>
            <div className="hero-proof">
              <span>
                <ShieldCheck size={16} /> 匿名分享
              </span>
              <span>
                <Check size={16} /> 结构化反馈
              </span>
              <span>
                <Clock3 size={16} /> 关注真实作息
              </span>
            </div>
          </div>
          <div className="weekend-calendar" aria-label="周六、周日，留给生活">
            <div className="calendar-heading">
              <span>周末，留白。</span>
              <span>THE WEEKEND EDIT</span>
            </div>
            <div className="calendar-days">
              <div>
                <span>星期六 / SAT</span>
                <strong>六</strong>
                <p>睡到自然醒</p>
              </div>
              <div>
                <span>星期日 / SUN</span>
                <strong>日</strong>
                <p>去过自己的生活</p>
              </div>
            </div>
            <div className="calendar-footer">
              <span>本周待办</span>
              <strong>好好生活</strong>
              <span className="calendar-stamp">不加班</span>
            </div>
          </div>
        </div>
      </section>
      <div className="container home-content">
        <div className="discovery-bar">
          <div>
            <Compass size={19} />
            <span>找工作，也要看下班以后。</span>
          </div>
          <div>
            <b>{companies.length}</b> 家已收录公司
            <span className="stat-divider" />
            <b>{reviews.length}</b> 条工作体验
          </div>
        </div>
        <div className="section-heading">
          <div>
            <span className="section-kicker">01 / 公司观察</span>
            <h2>下一站，去哪上班？</h2>
            <p>作息、双休、团队体验，一起看清楚。</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/companies">
              浏览公司库 <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
        {ranked.length ? (
          <div className="company-grid">
            {ranked.slice(0, 3).map((item) => (
              <CompanyCard key={item.company.id} {...item} />
            ))}
          </div>
        ) : (
          <Card className="discovery-empty">
            <div className="empty-icon">
              <Building2 size={28} />
            </div>
            <div>
              <h3>好公司的线索，从你开始。</h3>
              <p>公司库正在建立中，欢迎补充你了解的公司。</p>
            </div>
            <Button asChild>
              <Link href="/companies/submit">
                补充第一家公司 <ArrowRight size={16} />
              </Link>
            </Button>
          </Card>
        )}
        <div className="home-lower">
          <section>
            <div className="section-heading">
              <div>
                <span className="section-kicker">02 / 下班后聊聊</span>
                <h2>在这里工作，是什么感觉</h2>
              </div>
              <Badge variant="secondary">员工视角</Badge>
            </div>
            {latest.length ? (
              latest.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  companyName={
                    companies.find((c) => c.id === review.companyId)?.name
                  }
                />
              ))
            ) : (
              <Card className="review-empty">
                <MessageSquare size={30} />
                <h3>你的日常，是别人的重要参考。</h3>
                <p>
                  几点下班、周末是否加班、团队如何相处。
                  <br />
                  一份客观的分享，能帮助下一个人做决定。
                </p>
                <Button asChild variant="outline">
                  <Link href="/reviews/new">
                    分享工作体验 <ArrowRight size={16} />
                  </Link>
                </Button>
              </Card>
            )}
          </section>
          <aside className="home-aside">
            <Card className="ranking-promo">
              <div className="promo-top">
                <Trophy size={22} />
                <span>周末活着 · 双休榜</span>
                <ArrowUpRight size={18} />
              </div>
              <h2>
                把周末
                <br />
                写进下一份工作。
              </h2>
              <p>基于员工反馈，发现双休友好的公司。</p>
              <Button asChild variant="secondary">
                <Link href="/rankings">
                  查看真双休榜 <ArrowRight size={16} />
                </Link>
              </Button>
              <span className="promo-numeral" aria-hidden="true">
                02
              </span>
            </Card>
          </aside>
        </div>
        <div className="bottom-note">
          <ShieldCheck size={22} />
          <p>
            <strong>真实有上下文，数据有边界。</strong>
            <br />
            同一公司的城市、岗位与团队，体验可能不同。我们呈现反馈，帮助你独立判断。
          </p>
          <Link href="/about">
            了解数据规则 <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
