// src/components/climateanalytics/ClimateAIInsights.jsx

export default function ClimateAIInsights({ analytics, query }) {
  return (
    <div
      className="card card-pad"
      style={{
        background: "linear-gradient(135deg, #f1f6ff, #fcf4f8)",
        border: "1px solid #dce6f4",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <span style={{ fontSize: "20px" }}>🤖</span>
        <strong style={{ fontSize: "16px", color: "var(--primary-dark)" }}>
          HAWK-AI 기후·환경 대응 분석 브리핑
        </strong>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "14px",
          lineHeight: "1.75",
          color: "#344054",
        }}
      >
        현재 <strong>{query.season}</strong> 시즌의{" "}
        <strong>{query.weatherEvent}</strong> 조건 분석 결과, 강수량 누적과 유속
        증가로 인해 하류 배수구 지점에 부유성 폐기물(스티로폼, 플라스틱) 집적이
        평시 대비 <strong>42.8%</strong> 증가했습니다. 호우 특보 발효 전 해당
        배수로 부근 차단막 점검을 권고합니다.
      </p>
    </div>
  );
}
