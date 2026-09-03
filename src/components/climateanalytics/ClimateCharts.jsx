// src/components/climateanalytics/ClimateCharts.jsx
"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart, Doughnut } from "react-chartjs-2";

// Chart.js 모듈 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const PALETTE = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

export default function ClimateCharts({
  trends = [],
  distribution = [],
  query,
}) {
  // 1. 좌측 이중축 차트 데이터 가공 (Bar: 탐지건수, Line: 강수량)
  // 날짜를 "M/D" 형식(예: 9/1, 8/25)으로 변환하는 유틸
  const formatShortDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length >= 3) {
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      return `${month}/${day}`;
    }
    return dateStr;
  };

  // 1. 좌측 이중축 차트 데이터 가공
  const trendsChartData = useMemo(() => {
    const labels = trends.map((t) => formatShortDate(t.date));
    const detectionCounts = trends.map((t) => t.detections || 0);
    const rainfalls = trends.map((t) => t.rainfall || 0);

    return {
      labels,
      datasets: [
        {
          type: "bar",
          label: "폐기물 탐지",
          data: detectionCounts,
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderColor: "#3b82f6",
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: "yDetections",
          order: 2,
        },
        {
          type: "line",
          label: "일일 강수량",
          data: rainfalls,
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.2)",
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.3,
          yAxisID: "yRainfall",
          order: 1,
        },
      ],
    };
  }, [trends]);

  // 좌측 차트 옵션 (이중 y축 설정)
  const trendsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: { boxWidth: 12, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const unit = context.dataset.yAxisID === "yRainfall" ? "mm" : "건";
            return ` ${context.dataset.label}: ${context.parsed.y.toLocaleString()} ${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      yDetections: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        title: { display: true, text: "탐지 건수 (건)", font: { size: 11 } },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
      yRainfall: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        title: { display: true, text: "강수량 (mm)", font: { size: 11 } },
        grid: { display: false }, // 격자선 겹침 방지
      },
    },
  };

  // 2. 우측 도넛 차트 데이터 가공 (폐기물 유형별 점유율)
  const distributionChartData = useMemo(() => {
    return {
      labels: distribution.map((d) => d.label || "미지정"),
      datasets: [
        {
          data: distribution.map((d) => d.count || 0),
          backgroundColor: PALETTE.slice(0, distribution.length),
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };
  }, [distribution]);

  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: { boxWidth: 12, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const val = context.parsed || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${val.toLocaleString()}건 (${pct}%)`;
          },
        },
      },
    },
    cutout: "68%", // 도넛 두께 조절
  };

  const hasTrends = trends && trends.length > 0;
  const hasDistribution = distribution && distribution.length > 0;

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
            강수량에 따른 폐기물 탐지 추이
          </h2>
          {/* <span className="badge draft">이중 축 그래프 (Dual-Axis)</span> */}
        </div>

        <div style={{ flex: 1, minHeight: "300px", position: "relative" }}>
          {hasTrends ? (
            <Chart type="bar" data={trendsChartData} options={trendsOptions} />
          ) : (
            <div
              style={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "var(--text-3)",
                fontSize: "14px",
              }}
            >
              해당 조건의 탐지 및 기상 추이 데이터가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 우측: 폐기물 유형별 도넛 차트 */}
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
          {/* <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
            점유율 (%)
          </span> */}
        </div>

        <div style={{ flex: 1, minHeight: "300px", position: "relative" }}>
          {hasDistribution ? (
            <Doughnut
              data={distributionChartData}
              options={distributionOptions}
            />
          ) : (
            <div
              style={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "var(--text-3)",
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
