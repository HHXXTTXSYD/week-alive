"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Palmtree,
  Building2,
  Trophy,
  UserRound,
  House,
  PenLine,
} from "lucide-react";
const links = [
  { href: "/", label: "首页", icon: House },
  { href: "/companies", label: "公司库", icon: Building2 },
  { href: "/rankings", label: "双休榜", icon: Trophy },
];
export function Navigation() {
  const path = usePathname();
  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link className="brand" href="/">
            <span className="brand-icon">
              <Palmtree size={25} />
            </span>
            周末活着<span className="brand-dot">.</span>
          </Link>
          <nav className="desktop-nav">
            {links.map((l) => (
              <Link
                key={l.href}
                className={path === l.href ? "active" : ""}
                href={l.href}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Button asChild>
              <Link className="write-link" href="/reviews/new">
                <PenLine size={16} /> 写评价
              </Link>
            </Button>
            <Link className="account-link" href="/me">
              <UserRound size={19} />
              <span>我的</span>
            </Link>
          </div>
        </div>
      </header>
      <nav className="mobile-nav">
        {[
          ...links,
          { href: "/reviews/new", label: "写评价", icon: PenLine },
          { href: "/me", label: "我的", icon: UserRound },
        ].map((l) => (
          <Link
            key={l.href}
            className={path === l.href ? "active" : ""}
            href={l.href}
          >
            <l.icon size={20} />
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
