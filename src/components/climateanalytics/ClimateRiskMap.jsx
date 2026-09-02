// src/components/climateanalytics/ClimateRiskMap.jsx

export default function ClimateRiskMap({ items = [], trends = [], query }) {
  return (
    <div
      className="card card-pad"
      style={{ minHeight: "380px", marginBottom: "22px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>
            기상 이벤트 취약 집적 위험 지도
          </h2>
          <p
            className="subtitle"
            style={{ margin: "4px 0 0", fontSize: "13px" }}
          >
            강수/풍속 집중 시 부유 쓰레기가 누적되는 주요 배수구 및 하천 관측
            포인트
          </p>
        </div>
        <span className="badge action_required">위험 관리 구역</span>
      </div>

      <div
        style={{
          height: "280px",
          display: "grid",
          placeItems: "center",
          background: "var(--surface-soft)",
          border: "1px dashed var(--border)",
          borderRadius: "var(--content-card-radius)",
          color: "var(--text-3)",
          fontSize: "14px",
        }}
      >
        [GIS Map 영역: 수원/서부 배수로 관측 핀포인트 표시]
      </div>
    </div>
  );
}
