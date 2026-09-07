export default function Loading() {
  return (
    <section
      className="container state-page loading-page"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-content">
        <div className="loading-calendar" aria-hidden="true">
          <div>
            <span>星期六</span>
            <strong>六</strong>
          </div>
          <div>
            <span>星期日</span>
            <strong>日</strong>
          </div>
        </div>
        <span className="section-kicker">翻过工作日，就是好周末</span>
        <h1>正在翻开下一页</h1>
        <p>公司与工作体验，马上就来。</p>
        <div className="loading-week" aria-hidden="true">
          {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
