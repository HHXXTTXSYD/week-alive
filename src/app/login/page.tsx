import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LoginForm } from "@/components/forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
export const metadata = { title: "登录与注册" };
export default function Login() {
  return (
    <div className="container auth-container">
      <aside className="auth-story">
        <Badge variant="outline">
          <Sparkles size={14} /> YOUR NEXT CHAPTER
        </Badge>
        <h2>
          下一份工作，
          <br />
          把生活也
          <br />
          <span>考虑进去。</span>
        </h2>
        <p>加入周末活着，找到属于自己的工作节奏。</p>
        <div className="auth-benefits">
          {[
            {
              icon: Bookmark,
              title: "收藏心仪公司",
              description: "为下一次选择，提前做好准备。",
            },
            {
              icon: MessageSquare,
              title: "分享亲身体验",
              description: "让你的真实经历，帮到更多人。",
            },
            {
              icon: ShieldCheck,
              title: "对外匿名展示",
              description: "表达工作感受，保留个人边界。",
            },
          ].map((item) => (
            <div key={item.title}>
              <span>
                <item.icon size={19} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/companies">
          先逛逛公司库 <ArrowUpRight size={16} />
        </Link>
      </aside>
      <Card className="auth-panel">
        <CardContent>
          <div className="auth-intro">
            <span className="section-kicker">WELCOME TO SHUANGXIUMA</span>
            <h1>欢迎来到周末活着</h1>
            <p>好工作和好生活，都值得认真选择。</p>
          </div>
          <LoginForm />
          <p className="auth-footer-note">
            <ShieldCheck size={14} /> 你的评价将匿名展示
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
