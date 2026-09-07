"use client";
import Link from "next/link";
import { useTransition } from "react";
import { ArrowRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageState } from "@/components/page-state";

export default function ErrorPage({ retry }: { retry: () => void }) {
  const [isPending, startTransition] = useTransition();
  return (
    <PageState
      code="连接暂缓"
      mark="歇"
      title="数据暂时没有加载成功"
      description="连接暂时中断了。可以再试一次，也可以先去别处逛逛。"
    >
      <Button onClick={() => startTransition(retry)} disabled={isPending}>
        <RotateCw
          size={16}
          className={isPending ? "retry-spinner" : undefined}
        />
        {isPending ? "正在重试…" : "重新加载"}
      </Button>
      <Button asChild variant="outline">
        <Link href="/">
          返回首页 <ArrowRight size={16} />
        </Link>
      </Button>
      <span className="sr-only" role="status">
        {isPending ? "正在重新加载数据" : ""}
      </span>
    </PageState>
  );
}
