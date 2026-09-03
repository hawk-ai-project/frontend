// src/components/climateanalytics/ClimateCharts.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// 차트 시각화용 테마 색상 팔레트
const COLORS = [
  "#8b5cf6",
  "#38bdf8",
  "#2563eb",
  "#3b82f6",
  "#6366f1",
  "#ec4899",
  "#10b981",
];

/**
 * 날짜 문자열(YYYY-MM-DD 등)을 'M/D' 포맷(예: 9/1)으로 변환하는 유틸 함수
 */
const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = String(dateStr).split("-");
  if (parts.length >= 3) {
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `${month}/${day}`;
  }
  return dateStr;
};

export default function ClimateCharts({
  trends = [],
  distribution = [],
  query = {},
}) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // 화면 리사이즈 감지를 통한 모바일 레이아웃 상태 관리
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 좌측 이중축 차트 데이터 가공 (최근 7일치 슬라이싱, M/D 날짜 포맷팅, 수치 정규화)
  const chartTrends = useMemo(() => {
    return (trends || []).slice(-7).map((item) => {
      // 1. 원본 날짜(YYYY-MM-DD) 확보
      const originDate = item.rawDate || item.date || "";

      // 2. M/D 포맷 안전 생성 ('-' 또는 '/' 둘 다 대응)
      let displayDate = originDate;
      if (originDate.includes("-")) {
        displayDate = formatShortDate(originDate);
      } else if (originDate.includes("/")) {
        const [m, d] = originDate.split("/");
        displayDate = `${parseInt(m, 10)}/${parseInt(d, 10)}`;
      }

      return {
        ...item,
        rawDate: originDate,
        date: displayDate,
        count: Number(item.detections ?? item.count ?? 0),
        rainfall: Number(item.rainfall ?? item.precipitation ?? 0),
      };
    });
  }, [trends]);

  // 기간 내 탐지 건수 최대값 계산 (피크 막대 강조용)
  const maxCount = Math.max(...chartTrends.map((item) => item.count), 0);

  // 우측 도넛 차트 데이터 정규화 (유효 수량 필터링 및 탐지 수량 기준 내림차순 정렬)
  const normalizedDistribution = useMemo(() => {
    return (distribution || [])
      .map((item) => {
        const value = Number(
          item.value ?? item.count ?? item.cnt ?? item.total ?? 0,
        );
        const name =
          item.name ??
          item.label ??
          item.wasteType ??
          item.waste_type ??
          "기타";
        return { ...item, name, value };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [distribution]);

  // 전체 탐지 폐기물 총합 계산
  const totalWaste = normalizedDistribution.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  // 막대그래프(날짜) 클릭 이벤트
  const handleBarClick = (data) => {
    if (!data) return;

    let targetDate = data.rawDate;
    if (!targetDate && data.date) {
      const [m, d] = data.date.split("/");
      const yyyy = new Date().getFullYear();
      targetDate = `${yyyy}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    if (!targetDate) return;

    const formattedDate = targetDate.replace(/-/g, ".");
    const params = new URLSearchParams();
    params.set("startDate", formattedDate);
    params.set("endDate", formattedDate);
    params.set("hasWaste", "true");

    if (query?.locationId) params.set("locationId", String(query.locationId));
    if (query?.season && query.season !== "ALL")
      params.set("season", query.season);
    if (query?.weatherEvent && query.weatherEvent !== "ALL")
      params.set("weatherEvent", query.weatherEvent);

    router.push(`/histories?${params.toString()}`);
  };

  // 도넛그래프(폐기물 항목) 클릭 이벤트
  const handlePieClick = (entry) => {
    if (!entry || !entry.name) return;

    const params = new URLSearchParams();
    params.set("waste", entry.name);
    params.set("hasWaste", "true");

    if (query?.locationId) params.set("locationId", String(query.locationId));
    if (query?.startDate)
      params.set("startDate", query.startDate.replace(/-/g, "."));
    if (query?.endDate) params.set("endDate", query.endDate.replace(/-/g, "."));
    if (query?.season && query.season !== "ALL")
      params.set("season", query.season);
    if (query?.weatherEvent && query.weatherEvent !== "ALL")
      params.set("weatherEvent", query.weatherEvent);

    router.push(`/histories?${params.toString()}`);
  };

  // 도넛 차트 중앙 텍스트 렌더링 (총 탐지량 표시)
  const renderCenterLabel = ({ cx, cy, index }) => {
    if (index !== 0) return null;

    return (
      <g>
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: isMobile ? "11px" : "12px",
            fill: "#64748b",
            fontWeight: "500",
          }}
        >
          총 탐지량
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: isMobile ? "15px" : "18px",
            fill: "#0f172a",
            fontWeight: "bold",
          }}
        >
          {totalWaste}개
        </text>
      </g>
    );
  };

  // 기본 텍스트 포맷터
  const renderLegendText = (value, entry) => {
    const itemValue = entry.payload?.value ?? 0;
    const percentage =
      totalWaste > 0 ? ((itemValue / totalWaste) * 100).toFixed(1) : 0;

    return (
      <span
        style={{
          color: "#334155",
          fontSize: isMobile ? "11px" : "13px",
          marginLeft: "4px",
        }}
      >
        {value} <strong style={{ color: "#0f172a" }}>{itemValue}개</strong> (
        {percentage}%)
      </span>
    );
  };

  const hasTrends = chartTrends.length > 0;
  const hasDistribution = normalizedDistribution.length > 0;

  return (
    <div
      id="climate-charts-area"
      className="grid grid-2"
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
        gap: "22px",
        marginBottom: "24px",
      }}
    >
      {/* 좌측 차트: 강수량 및 폐기물 탐지 추이 */}

      <div className="card card-pad">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
            강수량에 따른 폐기물 탐지 추이
          </h2>
        </div>

        <div style={{ width: "100%", height: isMobile ? "260px" : "320px" }}>
          {hasTrends ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartTrends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="primaryBarGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
                  </linearGradient>

                  {/* 피크(최고치) 막대 */}
                  <linearGradient
                    id="peakBarGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={1} />
                  </linearGradient>
                </defs>

                {/* 차트 배경 가로 보조선 */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                {/* X축: 일자 (M/D 형식) */}
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />

                {/* 좌측 Y축: 폐기물 탐지 건수 */}
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  unit="건"
                  tick={{ fontSize: 12 }}
                />

                {/* 우측 Y축: 일일 강수량 */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  stroke="#06b6d4"
                  unit="mm"
                  tick={{ fontSize: 12 }}
                />

                {/* 툴팁: 마우스 오버 시 데이터 표시 */}
                <Tooltip
                  formatter={(val, name) => {
                    if (name === "일일 강수량") return [`${val} mm`, name];
                    return [`${val} 건`, "폐기물 탐지"];
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />

                {/* 폐기물 탐지 건수 막대 */}
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="폐기물 탐지"
                  radius={[6, 6, 0, 0]}
                  style={{ cursor: "pointer" }}
                >
                  {chartTrends.map((entry, index) => {
                    const isPeak = maxCount > 0 && entry.count === maxCount;
                    return (
                      <Cell
                        key={`bar-cell-${index}`}
                        fill={
                          isPeak
                            ? "url(#peakBarGradient)"
                            : "url(#primaryBarGradient)"
                        }
                        onClick={() => handleBarClick(entry)}
                      />
                    );
                  })}
                </Bar>

                {/* 일일 강수량 꺾은선 */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rainfall"
                  name="일일 강수량"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: "#06b6d4",
                    strokeWidth: 1,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              해당 조건의 탐지 및 기상 추이 데이터가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 우측 차트: 기상 조건별 폐기물 분포 */}

      <div className="card card-pad">
        <h2
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}
        >
          기상 조건별 폐기물 분포
        </h2>

        <div style={{ width: "100%", height: isMobile ? "360px" : "320px" }}>
          {hasDistribution ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* 도넛 그래프 (12시 방향 시작, 시계 방향 회전) */}
                <Pie
                  data={normalizedDistribution}
                  cx={isMobile ? "50%" : "40%"}
                  cy={isMobile ? "35%" : "50%"}
                  innerRadius={isMobile ? 50 : 65}
                  outerRadius={isMobile ? 75 : 95}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  startAngle={90}
                  endAngle={-270}
                  label={renderCenterLabel}
                  labelLine={false}
                >
                  {normalizedDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      style={{ cursor: "pointer" }}
                      onClick={() => handlePieClick(entry)}
                    />
                  ))}
                </Pie>

                {/* 툴팁 */}
                <Tooltip
                  formatter={(val) => [`${val}개`, "수량"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />

                {/* 커스텀 범례: 수량 내림차순 정렬을 유지하는 우측 리스트 */}
                <Legend
                  layout={isMobile ? "horizontal" : "vertical"}
                  align={isMobile ? "center" : "right"}
                  verticalAlign={isMobile ? "bottom" : "middle"}
                  content={() => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "row" : "column",
                        flexWrap: isMobile ? "wrap" : "nowrap",
                        gap: isMobile ? "8px 12px" : "8px",
                        maxHeight: isMobile ? "none" : "280px",
                        overflowY: isMobile ? "visible" : "auto",
                        paddingLeft: isMobile ? "0" : "10px",
                        paddingTop: isMobile ? "12px" : "0",
                      }}
                    >
                      {normalizedDistribution.map((item, index) => {
                        const itemColor = COLORS[index % COLORS.length];
                        const percentage =
                          totalWaste > 0
                            ? ((item.value / totalWaste) * 100).toFixed(1)
                            : 0;

                        return (
                          <div
                            key={`legend-item-${index}`}
                            onClick={() => handlePieClick(item)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                              fontSize: isMobile ? "11px" : "13px",
                              lineHeight: "1.4",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: "10px",
                                height: "10px",
                                borderRadius: "2px",
                                backgroundColor: itemColor,
                                marginRight: "6px",
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ color: "#334155" }}>
                              {item.name}{" "}
                              <strong style={{ color: "#0f172a" }}>
                                {item.value}개
                              </strong>{" "}
                              ({percentage}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              유형별 폐기물 데이터가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
