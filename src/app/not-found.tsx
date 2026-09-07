import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageState } from "@/components/page-state";
export default function NotFound() {
  return (
    <PageState
      code="404 / 未找到"
      mark="空"
      title="这一页暂时走丢了"
      description="地址可能有误，或公司尚未收录。换个方向，继续找找。"
    >
      <Button asChild>
        <Link href="/companies">
          回到公司库 <ArrowRight size={16} />
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/">返回首页</Link>
      </Button>
    </PageState>
  );
}
