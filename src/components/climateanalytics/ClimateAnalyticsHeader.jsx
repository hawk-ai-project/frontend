// src/components/climateanalytics/ClimateAnalyticsHeader.jsx
"use client";

import { useState, useEffect } from "react";

export default function ClimateAnalyticsHeader({
  regions = [],
  startDate,
  endDate,
  season,
  weatherEvent,
  locationId,
  comparePrevYear,
  setStartDate,
  setEndDate,
  setSeason,
  setWeatherEvent,
  setLocationId,
  setComparePrevYear,
  onSearch,
  onExport,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const inputStyle = {
    width: "100%",
    borderRadius: "var(--analytics-control-radius, 8px)",
    border: "1px solid #e2e8f0",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    height: "42px",
  };

  return (
    <div style={{ width: "100%", marginBottom: "24px" }}>
      {/* 상단 타이틀 영역 */}
      <div className="page-head" style={{ marginBottom: "8px" }}>
        <div>
          <div className="eyebrow">CLIMATE & SEASONAL ANALYTICS</div>
          <h1 style={{ margin: 0 }}>기후·계절별 통계분석</h1>
        </div>
      </div>

      {/* 서브타이틀 & 엑셀 내보내기 버튼 */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <p className="subtitle" style={{ margin: 0 }}>
          태풍, 장마, 폭염, 한파 등 기상 조건 및 계절별 폐기물 유입 패턴을
          분석합니다.
        </p>
      </div>

      {/* 하단 필터 검색 카드 영역 */}
      <form
        className="content-card analytics-filter-card"
        onSubmit={onSearch}
        style={{
          borderRadius: "var(--analytics-card-radius, 12px)",
          padding: "16px 20px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: isMobile ? "nowrap" : "wrap",
          gap: "12px",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#ffffff",
        }}
      >
        {/* 계절 선택 */}
        <div
          style={{
            flex: isMobile ? "none" : "1",
            minWidth: isMobile ? "100%" : "140px",
            width: "100%",
          }}
        >
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            style={inputStyle}
          >
            <option value="ALL">전체 계절</option>
            <option value="SPRING">봄 (3~5월)</option>
            <option value="SUMMER">여름 (6~8월)</option>
            <option value="FALL">가을 (9~11월)</option>
            <option value="WINTER">겨울 (12~2월)</option>
          </select>
        </div>

        {/* 기상 조건 선택 */}
        <div
          style={{
            flex: isMobile ? "none" : "1",
            minWidth: isMobile ? "100%" : "150px",
            width: "100%",
          }}
        >
          <select
            value={weatherEvent}
            onChange={(e) => setWeatherEvent(e.target.value)}
            style={inputStyle}
          >
            <option value="ALL">전체 기상 조건</option>
            <option value="HEAVY_RAIN">집중호우/장마</option>
            <option value="TYPHOON">태풍 경보</option>
            <option value="HEAT_WAVE">폭염/혹서</option>
            <option value="COLD_WAVE">한파/혹한</option>
          </select>
        </div>

        {/* 지역 선택 */}
        <div
          style={{
            flex: isMobile ? "none" : "1",
            minWidth: isMobile ? "100%" : "140px",
            width: "100%",
          }}
        >
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            style={inputStyle}
          >
            <option value="">전체 지역</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* 조회 버튼 */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            padding: "10px 24px",
            fontSize: "14px",
            fontWeight: "600",
            whiteSpace: "nowrap",
            flexShrink: 0,
            width: isMobile ? "100%" : "auto",
            height: "42px",
            borderRadius: "var(--analytics-control-radius, 8px)",
            cursor: "pointer",
          }}
        >
          조회
        </button>
      </form>
    </div>
  );
}
