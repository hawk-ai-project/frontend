// src/components/climateanalytics/ClimateSummaryCards.jsx

export default function ClimateSummaryCards({ summary = {} }) {
  return (
    <div
      className="grid grid-3 section-gap"
      style={{ marginTop: "0", marginBottom: "22px" }}
    >
      {/* 카드 1 */}
      <div className="card card-pad analytics-summary-card">
        <div
          className="eyebrow"
          style={{ color: "var(--text-3)", fontSize: "12px" }}
        >
          기상 조건 내 총 탐지량
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "var(--text)",
            margin: "8px 0 4px",
          }}
        >
          {summary.eventTotalDetections?.toLocaleString() ?? 0}{" "}
          <span
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: "var(--text-3)",
            }}
          >
            건
          </span>
        </div>
        <div
          style={{ fontSize: "13px", fontWeight: 700, color: "var(--danger)" }}
        >
          ▲ 평시 대비 +{summary.increaseRate ?? 0}%
        </div>
      </div>

      {/* 카드 2 */}
      <div className="card card-pad analytics-summary-card">
        <div
          className="eyebrow"
          style={{ color: "var(--text-3)", fontSize: "12px" }}
        >
          주요 다발 폐기물
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "var(--primary-dark)",
            margin: "8px 0 4px",
          }}
        >
          {summary.primaryWasteType || "-"}
        </div>
        <div
          style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)" }}
        >
          전체 검출 중 {summary.primaryWasteRate ?? 0}% 점유
        </div>
      </div>

      {/* 카드 3 */}
      <div className="card card-pad analytics-summary-card">
        <div
          className="eyebrow"
          style={{ color: "var(--text-3)", fontSize: "12px" }}
        >
          최고 집적 위험 구역
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "var(--text)",
            margin: "8px 0 4px",
          }}
        >
          {summary.highestRiskArea || "-"}
        </div>
        <div
          style={{ fontSize: "13px", fontWeight: 700, color: "var(--success)" }}
        >
          전년 동일 기간 대비 {summary.prevYearComparisonRate ?? 0}%
        </div>
      </div>
    </div>
  );
}
