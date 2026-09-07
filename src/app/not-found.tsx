import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container empty-state page-space">
      <h1>这一页暂时走丢了</h1>
      <p>公司可能尚未收录，试试重新搜索。</p>
      <Link href="/companies">回到公司库</Link>
    </div>
  );
}
