import type { ReactNode } from "react";

export function PageState({
  code,
  mark,
  title,
  description,
  children,
}: {
  code: string;
  mark: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="container state-page" aria-labelledby="state-title">
      <div className="state-sheet">
        <div className="state-sheet-top">
          <span>周末活着 / 工作生活指南</span>
          <span>{code}</span>
        </div>
        <div className="state-content">
          <div className="state-mark" aria-hidden="true">
            {mark}
          </div>
          <span className="section-kicker">稍作停留，也没关系</span>
          <h1 id="state-title">{title}</h1>
          <p>{description}</p>
          <div className="state-actions">{children}</div>
        </div>
        <div className="state-sheet-foot">工作之外，生活照常。</div>
      </div>
    </section>
  );
}
