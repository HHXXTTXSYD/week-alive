import type { Review } from "@/lib/domain";
import { ActionButton, Feedback } from "./interactions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export function ReviewCard({
  review,
  companyName,
}: {
  review: Review;
  companyName?: string;
}) {
  return (
    <Card className="review-card">
      <div className="review-heading">
        <span className="avatar">匿</span>
        <div>
          <strong>匿名员工</strong>
          <p>
            {review.job} · {review.city} · {review.employment}
          </p>
        </div>
        <time>{review.createdAt.slice(0, 10)}</time>
      </div>
      {companyName && (
        <h3 className="review-company">
          在 {companyName} 工作是一种怎样的体验？
        </h3>
      )}
      <div className="tags">
        <Badge variant="secondary" className="green">
          {review.policy}
        </Badge>
        <Badge variant="outline">{review.offTime}下班</Badge>
        <Badge variant="outline">周末加班：{review.overtime}</Badge>
      </div>
      <p className="review-content">{review.content || review.pros}</p>
      {!companyName && (
        <div className="pros-cons">
          <p>
            <b>优点</b> {review.pros}
          </p>
          <p>
            <b>不足</b> {review.cons}
          </p>
        </div>
      )}
      <div className="review-actions">
        <ActionButton kind="vote" id={review.id} />
        <Feedback id={review.id} />
      </div>
    </Card>
  );
}
