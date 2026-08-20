"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analyticsService";
import { getApiErrorMessage } from "@/services/apiClient";
import { exportAnalyticsToExcel } from "@/utils/excelExport";
import AnalyticsHeader from "./AnalyticsHeader";
import AnalyticsSummaryCards from "./AnalyticsSummaryCards";
import AnalyticsCharts from "./AnalyticsCharts";
import AnalyticsMap from "./AnalyticsMap";
import AIAnalyticsInsights from "./AIAnalyticsInsights";
import CommonLoading from "@/components/common/CommonLoading";

// YYYY-MM-DD 날짜 포맷 변환 함수
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 오늘 및 7일 전 날짜 초기값 계산
const getInitialDates = () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  return {
    startDate: formatDate(weekAgo),
    endDate: formatDate(today),
  };
};

export default function AnalyticsClient() {
  const initialDates = getInitialDates();

  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);
  const [locationId, setLocationId] = useState("");

  // 지역 기준정보 목록 저장용 State
  const [regions, setRegions] = useState([]);

  const [query, setQuery] = useState({
    startDate: initialDates.startDate,
    endDate: initialDates.endDate,
    locationId: undefined,
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 마운트 시 지역 기준정보 목록(regions) API 호출
  useEffect(() => {
    let cancelled = false;

    analyticsService
      .getRegions()
      .then((regionList) => {
        if (!cancelled && Array.isArray(regionList)) {
          setRegions(regionList);
        }
      })
      .catch((err) => {
        console.error("지역 목록을 불러오는 중 오류 발생:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 통계 데이터 조회
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

  const handleExport = () => {
    exportAnalyticsToExcel(data, query, "analytics-charts-area");
  };

  return (
    <div className="page-shell">
      <AnalyticsHeader
        regions={regions}
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
            query={query} // query 전달 추가
          />
          <AnalyticsMap
            items={data.locations || data.items || data.inspections || []}
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
