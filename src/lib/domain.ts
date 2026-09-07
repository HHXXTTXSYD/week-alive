import { z } from "zod";

export const policies = [
  "正常双休",
  "偶尔周六加班",
  "大小周",
  "长期单休",
  "其他",
] as const;
export const times = [
  "18点前",
  "18–19点",
  "19–20点",
  "20–21点",
  "21–22点",
  "22点以后",
] as const;
export const frequencies = ["基本没有", "偶尔", "经常", "基本每周"] as const;
export const cities = [
  "北京",
  "上海",
  "深圳",
  "杭州",
  "武汉",
  "成都",
  "广州",
  "南京",
];
export const jobs = [
  "前端开发",
  "后端开发",
  "产品经理",
  "UI设计",
  "测试开发",
  "算法工程师",
  "运营",
];
export const reviewSchema = z.object({
  companyId: z.string().uuid(),
  city: z.string().min(1).max(40),
  job: z.enum(jobs as [string, ...string[]]),
  employment: z.enum(["在职", "已离职", "实习"]),
  policy: z.enum(policies),
  offTime: z.enum(times),
  overtime: z.enum(frequencies),
  messages: z.enum(["基本不需要", "偶尔", "经常"]),
  wlb: z.number().int().min(1).max(5),
  salary: z.number().int().min(1).max(5),
  team: z.number().int().min(1).max(5),
  management: z.number().int().min(1).max(5),
  growth: z.number().int().min(1).max(5),
  pros: z.string().trim().min(10, "优点至少填写 10 个字").max(1000),
  cons: z.string().trim().min(10, "不足至少填写 10 个字").max(1000),
  content: z.string().max(2000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
export type Review = ReviewInput & {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
};
export type Company = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  size: string;
  description: string;
  website: string;
  cities: string[];
  color: string;
  mark: string;
};
export function statistics(reviews: Review[]) {
  const valid = reviews.filter((r) => r.status === "published");
  const count = valid.length;
  const distribution = times.map((name) => ({
    name,
    count: valid.filter((r) => r.offTime === name).length,
  }));
  const rate =
    count < 3
      ? null
      : Math.round(
          (valid.filter((r) => r.policy === policies[0]).length / count) * 100,
        );
  const friendliness =
    count < 3
      ? null
      : Math.round(
          (valid.reduce(
            (sum, r) => sum + [1, 0.7, 0.3, 0, 0][policies.indexOf(r.policy)],
            0,
          ) /
            count) *
            100,
        );
  const minutes = count
    ? Math.round(
        valid.reduce(
          (sum, r) => sum + (17.5 + times.indexOf(r.offTime)) * 60,
          0,
        ) /
          count /
          5,
      ) * 5
    : 0;
  return {
    count,
    rate,
    friendliness,
    distribution,
    offTime:
      count < 3
        ? "—"
        : `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`,
    overtime:
      count < 3
        ? null
        : Math.round(
            (valid.filter((r) => r.overtime !== "基本没有").length / count) *
              100,
          ),
    score:
      count < 3
        ? "—"
        : (
            (valid.reduce(
              (sum, r) =>
                sum + r.wlb + r.salary + r.team + r.management + r.growth,
              0,
            ) /
              count /
              5) *
            2
          ).toFixed(1),
    confidence:
      count < 3
        ? "样本不足"
        : count < 10
          ? "低"
          : count < 30
            ? "一般"
            : count < 100
              ? "较高"
              : "高",
  };
}
