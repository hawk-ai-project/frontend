'use client';

import { useEffect, useState } from "react";
import Workbook from "exceljs";
import { toPng } from "html-to-image";
import { analyticsService } from "@/services/analyticsService";
import { getApiErrorMessage } from "@/services/apiClient";
import AnalyticsHeader from "./AnalyticsHeader";
import AnalyticsSummaryCards from "./AnalyticsSummaryCards";
import AnalyticsCharts from "./AnalyticsCharts";
import AnalyticsInsights from "./AnalyticsInsights";

export default function AnalyticsClient() {
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-10");
  const [locationId, setLocationId] = useState("");
  const [query, setQuery] = useState({
    startDate: "2026-08-01",
    endDate: "2026-08-10",
    locationId: undefined,
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    analyticsService
      .getSummary({
        startDate: query.startDate,
        endDate: query.endDate,
        locationId: query.locationId || undefined,
      })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError("");
      })
      .catch((requestError) => {
        if (cancelled) return;
        setData(null);
        setError(
          getApiErrorMessage(
            requestError,
            "통계 데이터를 불러오지 못했습니다.",
          ),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const search = (event) => {
    if (event) event.preventDefault();
    setQuery({ startDate, endDate, locationId });
  };

  // 고급 엑셀 스타일링 & 차트 이미지 내보내기
  const handleExport = async () => {
    if (!data) {
      alert("내보낼 통계 데이터가 없습니다.");
      return;
    }

    const workbook = new Workbook.Workbook();
    const worksheet = workbook.addWorksheet("통계 분석 보고서");

    // 공통 테두리 스타일
    const thinBorder = {
      top: { style: "thin", color: { argb: "E2E8F0" } },
      left: { style: "thin", color: { argb: "E2E8F0" } },
      bottom: { style: "thin", color: { argb: "E2E8F0" } },
      right: { style: "thin", color: { argb: "E2E8F0" } },
    };

    // 컬럼 너비 설정
    worksheet.columns = [
      { width: 20 },
      { width: 22 },
      { width: 25 },
      { width: 25 },
    ];

    // 1. 타이틀 영역
    worksheet.mergeCells("A1:D1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "통계 분석 보고서";
    titleCell.font = { name: "Pretendard", size: 18, bold: true, color: { argb: "0F172A" } };

    worksheet.mergeCells("A2:D2");
    const subTitleCell = worksheet.getCell("A2");
    subTitleCell.value = `조회 기간 : ${query.startDate} ~ ${query.endDate}`;
    subTitleCell.font = { name: "Pretendard", size: 11, color: { argb: "64748B" } };

    worksheet.addRow([]);

    // 2. 요약 지표 테이블 헤더
    const headerRow = worksheet.addRow(["지표명", "수치", "비고", "상태"]);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1E3B70" },
      };
      cell.font = { name: "Pretendard", size: 11, bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = thinBorder;
    });

    // 요약 데이터 추가
    const summaryRows = [
      ["기간 내 점검", `${data.summary?.totalInspections || 0}건`, `일평균 ${data.summary?.dailyAvgInspections || 0}건`, "정상"],
      ["탐지 폐기물", `${data.summary?.totalDetections || 0}개`, "전주 대비 +7.5%", "증가"],
      ["최다 탐지 항목", data.summary?.topDetectedItem?.name || "-", `${data.summary?.topDetectedItem?.count || 0}개`, "주의"],
      ["처리 완료율", `${data.summary?.resolutionRate || 0}%`, `${data.summary?.resolvedCount || 0}건 완료`, "양호"],
    ];

    summaryRows.forEach((rowData) => {
      const row = worksheet.addRow(rowData);
      row.height = 24;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Pretendard", size: 10, color: { argb: "1E293B" } };
        cell.alignment = {
          vertical: "middle",
          horizontal: colNumber === 1 ? "left" : "center",
        };
        cell.border = thinBorder;
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F8FAFC" },
        };
      });
    });

    worksheet.addRow([]);
    worksheet.addRow([]);

    // 3. 차트 영역 이미지 캡처 및 삽입
    const chartElement = document.getElementById("analytics-charts-area");
    if (chartElement) {
      try {
        const dataUrl = await toPng(chartElement, { quality: 0.95, backgroundColor: "#ffffff" });
        const imageId = workbook.addImage({
          base64: dataUrl,
          extension: "png",
        });

        // 차트 이미지를 엑셀의 특정 위치(E1 셀 기준 위치)에 추가
        worksheet.addImage(imageId, {
          tl: { col: 0, row: worksheet.rowCount + 1 },
          ext: { width: 750, height: 380 },
        });
      } catch (err) {
        console.error("차트 이미지 변환 실패:", err);
      }
    }

    // 파일 내보내기 실행
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `통계분석보고서_${query.startDate}_${query.endDate}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell">
      <AnalyticsHeader
        startDate={startDate}
        endDate={endDate}
        locationId={locationId}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setLocationId={setLocationId}
        onSearch={search}
        onExport={handleExport}
      />
      {loading && <p className="board-state">통계 데이터를 불러오는 중입니다.</p>}
      {!loading && error && (
        <p className="board-state board-state-error">{error}</p>
      )}
      {!loading && !error && data && (
        <>
          <AnalyticsSummaryCards summary={data.summary} />
          <AnalyticsCharts
            trends={data.trends}
            distribution={data.distribution}
          />
          <AnalyticsInsights insights={data.insights} />
        </>
      )}
    </div>
  );
}