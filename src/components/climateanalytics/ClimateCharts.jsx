// src/components/climateanalytics/ClimateCharts.jsx

export default function ClimateCharts({
  trends = [],
  distribution = [],
  query,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1.2fr)",
        gap: "22px",
        marginBottom: "22px",
      }}
    >
      {/* 좌측: 강수량/풍속 vs 탐지 추이 이중축 차트 */}
      <div
        className="card card-pad"
        style={{ display: "flex", flexDirection: "column", minHeight: "380px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 className="section-title" style={{ margin: 0 }}>
            강수량 및 풍속에 따른 폐기물 탐지 추이
          </h2>
          <span className="badge draft">이중 축 그래프 (Dual-Axis)</span>
        </div>
        <div
          style={{
            flex: 1,
            display: "grid",
            placeItems: "center",
            background: "var(--surface-soft)",
            border: "1px dashed var(--border)",
            borderRadius: "var(--content-card-radius)",
            color: "var(--text-3)",
            fontSize: "14px",
          }}
        >
          [Line & Bar Chart: 일별 강수량(mm) & 폐기물 탐지 건수 추이]
        </div>
      </div>

      {/* 우측: 폐기물 유형별 도넛/파이 차트 */}
      <div
        className="card card-pad"
        style={{ display: "flex", flexDirection: "column", minHeight: "380px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 className="section-title" style={{ margin: 0 }}>
            기상 조건별 폐기물 분포
          </h2>
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
            점유율 (%)
          </span>
        </div>
        <div
          style={{
            flex: 1,
            display: "grid",
            placeItems: "center",
            background: "var(--surface-soft)",
            border: "1px dashed var(--border)",
            borderRadius: "var(--content-card-radius)",
            color: "var(--text-3)",
            fontSize: "14px",
          }}
        >
          [Doughnut Chart: 스티로폼 38.5%, 페트병 25.6%, 목재 20%, 비닐 15.9%]
        </div>
      </div>
    </div>
  );
}
