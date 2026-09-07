import { Company, Review, policies, times, jobs } from "./domain";
// Fictional companies and feedback: never presented as actual employer evidence.
const names = [
  ["森屿科技", "senyu", "S", "互联网", "#159578", "北京,上海"],
  ["云间协作", "yunjian", "Y", "SaaS", "#5685db", "深圳,杭州"],
  ["小满设计", "xiaoman", "m", "设计", "#db9361", "上海,成都"],
  ["知更智能", "zhigeng", "Z", "AI", "#8c75c8", "北京,武汉"],
  ["原野互动", "yuanye", "W", "游戏", "#668b5d", "杭州,广州"],
  ["蓝湾数字", "lanwan", "L", "互联网", "#4b91a8", "武汉,南京"],
];
export const demoCompanies: Company[] = names.map((n, i) => ({
  id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  name: n[0],
  slug: n[1],
  mark: n[2],
  industry: n[3],
  color: n[4],
  cities: n[5].split(","),
  size: i % 2 ? "200–500人" : "500–1000人",
  description:
    "专注于数字产品与服务，让技术带来更简单、高效的工作体验。这里展示的是虚构公司，用于体验产品功能。",
  website: "",
}));
export const demoReviews: Review[] = demoCompanies.flatMap((company, i) =>
  Array.from({ length: i === 5 ? 2 : 36 - i * 5 }, (_, j) => ({
    id: `10000000-0000-4000-8000-${String(i * 100 + j).padStart(12, "0")}`,
    userId: "demo",
    companyId: company.id,
    city: company.cities[j % 2],
    job: jobs[j % jobs.length],
    employment: "在职",
    policy: policies[j % 10 < 9 - i ? 0 : 1],
    offTime: times[j % 10 < 7 ? 1 : (i % 3) + 2],
    overtime: j % 5 === 0 ? "偶尔" : "基本没有",
    messages: "偶尔",
    wlb: 5,
    salary: 4,
    team: 4,
    management: 4,
    growth: 4,
    pros: "团队沟通比较直接，工作安排清晰，平时可以按计划完成任务。",
    cons: "跨部门协作还有提升空间，项目集中交付时节奏会稍快一些。",
    content:
      j % 2
        ? "下班后可以安心安排自己的时间，周末去公园走走，生活和工作慢慢有了平衡。"
        : "入职前最关心的就是双休。大部分周末都能好好休息，偶尔上线会提前沟通安排。",
    status: "published",
    createdAt: new Date(Date.UTC(2026, 8, 6 - (j % 25))).toISOString(),
  })),
);
