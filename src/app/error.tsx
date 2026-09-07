"use client";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container empty-state page-space">
      <h1>数据暂时没有加载成功</h1>
      <p>请稍后重试，或检查服务连接。</p>
      <Button onClick={reset}>重新加载</Button>
    </div>
  );
}
