// src/components/climateanalytics/ClimateAnalyticsClient.jsx

"use client";

import { useEffect, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/services/apiClient";
import CommonLoading from "@/components/common/CommonLoading";

// 기후 분석용 하위 컴포넌트
import ClimateAnalyticsHeader from "./ClimateAnalyticsHeader";
import ClimateSummaryCards from "./ClimateSummaryCards";
import ClimateCharts from "./ClimateCharts";
import ClimateRiskMap from "./ClimateRiskMap";
import ClimateAIInsights from "./ClimateAIInsights";

// 날짜 포맷 유틸
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 기본 검색 기간 (최근 30일)
const getInitialClimateDates = () => {
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 30);

  return {
    startDate: formatDate(monthAgo),
    endDate: formatDate(today),
  };
};

export default function ClimateAnalyticsClient() {
  const initialDates = getInitialClimateDates();

  // 검색 조건 필터 State
  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);
  const [season, setSeason] = useState("ALL");
  const [weatherEvent, setWeatherEvent] = useState("ALL");
  const [locationId, setLocationId] = useState("");
  const [comparePrevYear, setComparePrevYear] = useState(false);

  // 권역 목록 State
  const [regions, setRegions] = useState([]);

  // 실제 조회를 트리거하는 쿼리 State (초기값을 ALL로 정렬)
  const [query, setQuery] = useState({
    startDate: initialDates.startDate,
    endDate: initialDates.endDate,
    season: "ALL", // 계절
    weatherEvent: "ALL", // 기상 조건
    locationId: undefined,
    comparePrevYear: false,
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 마운트 시 권역 목록 실제 API 조회
  useEffect(() => {
    let cancelled = false;

    const fetchRegions = async () => {
      try {
        const { data: regionList } = await apiClient.get(
          "/climate-analytics/regions",
        );
        if (!cancelled && Array.isArray(regionList)) {
          setRegions(regionList);
        }
      } catch (err) {
        console.error("권역 목록 로드 실패:", err);
      }
    };

    fetchRegions();

    return () => {
      cancelled = true;
    };
  }, []);

  // 기후·계절 통계 실제 데이터 조회
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchClimateAnalytics = async () => {
      try {
        const params = {
          startDate: query.startDate,
          endDate: query.endDate,
          ...(query.locationId && { locationId: query.locationId }),
          ...(query.season &&
            query.season !== "ALL" && { season: query.season }),
          ...(query.weatherEvent &&
            query.weatherEvent !== "ALL" && {
              weatherEvent: query.weatherEvent,
            }),
        };

        const { data: res } = await apiClient.get(
          "/climate-analytics/summary",
          { params },
        );

        if (cancelled) return;

        // 탐지 건수(detectionCount)가 실제로 1건 이상 존재하는 장소만 후보로 선정
        const validLocations = (res.locations || [])
          .filter((loc) => Number(loc.detectionCount || 0) > 0)
          .sort((a, b) => (b.detectionCount || 0) - (a.detectionCount || 0));

        // 유효한 탐지 내역이 있는 1위 장소만 카드에 전달, 없으면 '-'
        const topRiskArea =
          validLocations.length > 0
            ? validLocations[0].name || validLocations[0].address
            : "-";

        // 백엔드 응답 데이터를 하위 UI 컴포넌트 규격에 매핑
        const mappedData = {
          summary: {
            eventTotalDetections: res.summary?.totalDetections || 0,
            increaseRate: res.summary?.resolutionRate || 0,
            primaryWasteType: res.summary?.topDetectedItem?.name || "-",
            primaryWasteRate: res.summary?.topDetectedItem?.ratio || 0,
            highestRiskArea: topRiskArea,
            prevYearComparisonRate: 0,
          },
          trends: (res.trends || []).map((t) => ({
            rawDate: t.rawDate || t.raw_date || t.date,
            date: t.date,
            detections: t.count ?? t.detections ?? 0,
            rainfall: t.rainfall ?? t.precipitation ?? 0,
            windSpeed: t.windSpeed || 0,
          })),
          distribution: (res.distribution || []).map((d) => ({
            label: d.name,
            count: d.count,
            ratio: d.percentage,
          })),
          locations: (res.locations || []).map((loc) => ({
            id: loc.id || loc.location_id,
            name: loc.name || loc.address || "관측 포인트",
            address: loc.address || "-",
            regionId: loc.region_id ?? loc.regionId,
            regionName: loc.region_name ?? loc.regionName,
            lat: loc.latitude ?? loc.lat,
            lng: loc.longitude ?? loc.lng,
            count: loc.detectionCount ?? loc.count ?? loc.detection_count ?? 0,
          })),
        };

        setData(mappedData);
        setError("");
      } catch (requestError) {
        if (cancelled) return;
        setData(null);
        setError(
          getApiErrorMessage(
            requestError,
            "기후 분석 데이터를 불러오지 못했습니다.",
          ),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchClimateAnalytics();

    return () => {
      cancelled = true;
    };
  }, [query]);

  // 검색 버튼 클릭 핸들러
  const search = (event) => {
    if (event) event.preventDefault();
    setLoading(true);
    setQuery({
      startDate,
      endDate,
      season,
      weatherEvent,
      locationId: locationId || undefined,
      comparePrevYear,
    });
  };

  // 엑셀 내보내기 핸들러
  const handleExport = () => {
    alert("기후·계절별 분석 데이터를 엑셀로 내보냅니다.");
  };

  return (
    <div className="page-shell">
      {/* 기후/계절 특화 헤더 및 검색 필터 바 */}
      <ClimateAnalyticsHeader
        regions={regions}
        startDate={startDate}
        endDate={endDate}
        season={season}
        weatherEvent={weatherEvent}
        locationId={locationId}
        comparePrevYear={comparePrevYear}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setSeason={setSeason}
        setWeatherEvent={setWeatherEvent}
        setLocationId={setLocationId}
        setComparePrevYear={setComparePrevYear}
        onSearch={search}
        onExport={handleExport}
      />

      {/* 로딩 상태 표시 */}
      {loading && (
        <CommonLoading message="기후·계절별 분석 데이터를 계산 중입니다..." />
      )}

      {/* 에러 상태 표시 */}
      {!loading && error && (
        <p className="board-state board-state-error">{error}</p>
      )}

      {/* 데이터 정상 수신 시 화면 렌더링 */}
      {!loading && !error && data && (
        <>
          <ClimateSummaryCards summary={data.summary} />
          <ClimateCharts
            trends={data.trends}
            distribution={data.distribution}
            query={query}
          />
          <ClimateRiskMap
            items={data.locations || []}
            trends={data.trends || []}
            query={query}
          />
          <ClimateAIInsights
            key={`${query.season}-${query.weatherEvent}-${query.locationId || "all"}`}
            analytics={data}
            query={query}
          />
        </>
      )}
    </div>
  );
}
