'use client';

import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analyticsService";
import { getApiErrorMessage } from "@/services/apiClient";
import { exportAnalyticsToExcel } from "@/utils/excelExport"; // 추출한 유틸 모듈 임포트
import AnalyticsHeader from "./AnalyticsHeader";
import AnalyticsSummaryCards from "./AnalyticsSummaryCards";
import AnalyticsCharts from "./AnalyticsCharts";
import AIAnalyticsInsights from "./AIAnalyticsInsights";
import CommonLoading from "@/components/common/CommonLoading";

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
    setLoading(true);
    setQuery({ startDate, endDate, locationId });
  };

  // 단 한 줄의 함수 호출로 처리
  const handleExport = () => {
    exportAnalyticsToExcel(data, query, "analytics-charts-area");
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
      {loading && <CommonLoading message="통계 데이터를 불러오는 중..." />}
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
          <AIAnalyticsInsights
            key={`${query.startDate}-${query.endDate}-${query.locationId || "all"}`}
            analytics={data}
            query={query}
          />
        </>
      )}
    </div>
  );
}