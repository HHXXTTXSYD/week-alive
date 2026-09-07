import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "周末活着 · 找一家真正双休的公司", template: "%s | 周末活着" },
  description: "了解公司双休情况、下班时间和员工体验，让求职不再靠猜。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Navigation />
        {!process.env.DATABASE_URL && (
          <div className="demo-banner">
            产品预览 · 公司与评价均为虚构演示数据，不代表真实企业情况
          </div>
        )}
        <main>{children}</main>
        <footer className="footer container">
          <div>
            <strong>周末活着.</strong>
            <p>工作是生活的一部分，生活不止工作。</p>
          </div>
          <div>
            <Link href="/about">关于与数据说明</Link>
            <Link href="/companies/submit">补充公司</Link>
            <span>© 2026 周末活着</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
