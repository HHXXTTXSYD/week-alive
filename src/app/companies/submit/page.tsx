import { SubmissionForm } from "@/components/forms";
export const metadata = { title: "补充公司" };
export default function Submit() {
  return (
    <div className="container narrow page-space">
      <div className="page-heading">
        <span className="section-kicker">BUILD IT TOGETHER</span>
        <h1>补充一家你了解的公司</h1>
        <p>让更多公司的真实工作体验被看见。</p>
      </div>
      <SubmissionForm />
    </div>
  );
}
