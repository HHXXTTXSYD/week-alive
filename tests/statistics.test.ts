import { test } from "node:test";
import assert from "node:assert/strict";
import { statistics, reviewSchema } from "../src/lib/domain";
import { demoReviews } from "../src/lib/demo";
test("less than three published reviews cannot produce conclusions", () => {
  for (const count of [0, 1, 2]) {
    const result = statistics(demoReviews.slice(0, count));
    assert.equal(result.rate, null);
    assert.equal(result.friendliness, null);
    assert.equal(result.overtime, null);
    assert.equal(result.offTime, "—");
    assert.equal(result.confidence, "样本不足");
  }
});
test("pending reviews are excluded from statistics", () => {
  const rows = demoReviews.slice(0, 3);
  assert.equal(
    statistics([...rows, { ...rows[0], status: "pending", policy: "长期单休" }])
      .count,
    3,
  );
});
test("normal weekend rate differs from weighted friendliness", () => {
  const row = demoReviews[0];
  const result = statistics([
    { ...row, policy: "正常双休" },
    { ...row, policy: "偶尔周六加班" },
    { ...row, policy: "大小周" },
    { ...row, policy: "长期单休" },
  ]);
  assert.equal(result.rate, 25);
  assert.equal(result.friendliness, 50);
});
test("time bins and overtime share are calculated from submitted feedback", () => {
  const row = demoReviews[0];
  const result = statistics([
    { ...row, offTime: "18–19点", overtime: "基本没有" },
    { ...row, offTime: "19–20点", overtime: "基本没有" },
    { ...row, offTime: "20–21点", overtime: "偶尔" },
  ]);
  assert.equal(result.offTime, "19:30");
  assert.equal(result.overtime, 33);
  assert.equal(
    result.distribution.reduce((s, d) => s + d.count, 0),
    3,
  );
});
test("review validation rejects unknown enums, invalid ratings and empty content", () => {
  assert.ok(reviewSchema.safeParse(demoReviews[0]).success);
  assert.ok(!reviewSchema.safeParse({ ...demoReviews[0], wlb: 6 }).success);
  assert.ok(
    !reviewSchema.safeParse({ ...demoReviews[0], policy: "未知制度" }).success,
  );
  assert.ok(
    !reviewSchema.safeParse({ ...demoReviews[0], pros: "   " }).success,
  );
});
