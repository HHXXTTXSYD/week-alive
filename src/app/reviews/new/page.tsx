import { getCatalog } from "@/db/queries";
import { ReviewForm } from "@/components/forms";
export const metadata = { title: "分享工作体验" };
export default async function NewReview({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const [{ companies }, p] = await Promise.all([getCatalog(), searchParams]);
  return (
    <div className="container narrow page-space">
      <div className="page-heading">
        <span className="section-kicker">YOUR EXPERIENCE MATTERS</span>
        <h1>你的真实，帮到下一个人。</h1>
        <p>分享工作日常，让每一份选择多一点依据。</p>
      </div>
      <ReviewForm companies={companies} selected={p.company} />
    </div>
  );
}
