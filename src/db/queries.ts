import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "./index";
import * as schema from "./schema";
import { demoCompanies, demoReviews } from "@/lib/demo";
import type { Review } from "@/lib/domain";
export const getCatalog = cache(async () => {
  if (!db)
    return { companies: demoCompanies, reviews: demoReviews, demo: true };
  const [companies, locations, rows] = await Promise.all([
    db.select().from(schema.companies),
    db.select().from(schema.locations),
    db
      .select()
      .from(schema.reviews)
      .where(eq(schema.reviews.status, "published")),
  ]);
  return {
    companies: companies.map((c) => ({
      ...c,
      cities: locations.filter((l) => l.companyId === c.id).map((l) => l.city),
    })),
    reviews: rows.map((r) => ({
      ...r.data,
      id: r.id,
      userId: r.userId,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })) as Review[],
    demo: false,
  };
});
