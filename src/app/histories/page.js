"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import HistoryHeader from "@/components/history/HistoryHeader";
import HistoryList from "@/components/history/HistoryList";
import { ROUTES } from "@/constants/routes";
import { historyService } from "@/services/historyService";
import { analyticsService } from "@/services/analyticsService";
import { getApiErrorMessage } from "@/services/apiClient";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.replace(/[\.\/]/g, "-").trim();
};

const getInitialDates = () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  return {
    startDate: formatDate(weekAgo),
    endDate: formatDate(today),
  };
};

const calculateTotalDetections = (wasteSummary, backendCount) => {
  if (backendCount && backendCount > 0) return backendCount;
  if (!wasteSummary || wasteSummary === "탐지 결과 없음") return 0;

  const matches = wasteSummary.match(/(\d+)개/g);
  if (!matches) return 0;

  return matches.reduce((sum, match) => {
    const num = parseInt(match.replace("개", ""), 10);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
};

export default function HistoriesPage() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    const defaultDates = getInitialDates();
    const rawStartDate =
      searchParams.get("startDate") || searchParams.get("date");
    const rawEndDate = searchParams.get("endDate") || searchParams.get("date");

    return {
      keyword: searchParams.get("keyword") || "",
      locationId: searchParams.get("locationId") || "",
      waste: searchParams.get("waste") || "전체 폐기물",
      status: searchParams.get("status") || "전체 상태",
      hasWaste: searchParams.get("hasWaste") === "true", // URL의 hasWaste 파라미터 파싱
      startDate: rawStartDate
        ? normalizeDate(rawStartDate)
        : defaultDates.startDate,
      endDate: rawEndDate ? normalizeDate(rawEndDate) : defaultDates.endDate,
    };
  }, [searchParams]);

  const [items, setItems] = useState([]);
  const [regions, setRegions] = useState([]);
  const [wasteList, setWasteList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searched, setSearched] = useState(initialValues);

  const fetchData = useCallback(async (searchFilters = null) => {
    setIsLoading(true);
    try {
      // 1. 공통 옵션 목록(지역/폐기물) 병렬 요청
      const [regionsRes, wasteRes] = await Promise.allSettled([
        analyticsService.getRegions(),
        historyService.getWasteNames(),
      ]);

      let currentRegions = [];
      if (
        regionsRes.status === "fulfilled" &&
        Array.isArray(regionsRes.value)
      ) {
        currentRegions = regionsRes.value;
        setRegions(currentRegions);
      }

      if (wasteRes.status === "fulfilled" && Array.isArray(wasteRes.value)) {
        setWasteList(wasteRes.value);
      }

      // 2. 조회 조건 파라미터 매핑
      const queryParams = { limit: 100 };

      if (searchFilters) {
        if (searchFilters.keyword) queryParams.keyword = searchFilters.keyword;

        if (searchFilters.locationId) {
          const matchedRegion = currentRegions.find(
            (r) => String(r.id) === String(searchFilters.locationId),
          );
          queryParams.location = matchedRegion
            ? matchedRegion.name
            : searchFilters.locationId;
          queryParams.locationId = searchFilters.locationId;
        }

        if (searchFilters.waste && searchFilters.waste !== "전체 폐기물") {
          queryParams.waste = searchFilters.waste;
        }

        if (searchFilters.status && searchFilters.status !== "전체 상태") {
          queryParams.status = searchFilters.status;
        }

        if (searchFilters.hasWaste) {
          queryParams.hasWaste = true; // API 파라미터 전달
        }

        if (searchFilters.startDate) {
          queryParams.startDate = normalizeDate(searchFilters.startDate);
        }
        if (searchFilters.endDate) {
          queryParams.endDate = normalizeDate(searchFilters.endDate);
        }
      }

      // 3. 점검이력 목록 최종 요청
      const historiesRes = await historyService.getHistories(queryParams);

      if (Array.isArray(historiesRes)) {
        const mappedItems = historiesRes.map((row) => ({
          ...row,
          id: row.inspectionNo || `INSPECTION-${row.id}`,
          inspectionId: row.id,
          inspectedAt: row.capturedAt,
          detectedCount: calculateTotalDetections(
            row.wasteSummary,
            row.detectionCount,
          ),
          waste: row.wasteSummary,
        }));
        setItems(mappedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearched(initialValues);
    fetchData(initialValues);
  }, [initialValues, fetchData]);

  const handleSearch = (filters) => {
    setSearched(filters);
    fetchData(filters);
  };

  const handleUpdateStatus = async (ids, newStatus) => {
    try {
      await Promise.all(
        ids.map((id) =>
          historyService.updateNotes(id, `상태 변경: ${newStatus}`),
        ),
      );
      fetchData(searched);
    } catch (error) {
      alert(getApiErrorMessage(error, "상태 변경에 실패했습니다."));
    }
  };

  const handleDeleteSelected = async (inspectionIds) => {
    setIsDeleting(true);
    try {
      await Promise.all(
        inspectionIds.map((id) => historyService.deleteHistory(id)),
      );
      fetchData(searched);
    } catch (error) {
      alert(getApiErrorMessage(error, "삭제 처리에 실패했습니다."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-shell history-page">
      <div className="page-head">
        <div>
          <div className="eyebrow">History</div>
          <h1>점검 이력</h1>
          <p className="subtitle">
            저장된 점검 기록을 조건별로 검색하고 처리 상태를 확인합니다.
          </p>
        </div>
        <Link className="btn btn-primary" href={ROUTES.inspection}>
          + 새 점검
        </Link>
      </div>

      <HistoryHeader
        key={`${initialValues.startDate}_${initialValues.endDate}_${initialValues.locationId}_${initialValues.hasWaste}`}
        onSearch={handleSearch}
        regions={regions}
        wasteList={wasteList}
        initialValues={initialValues}
      />
      <HistoryList
        items={items}
        isLoading={isLoading}
        isDeleting={isDeleting}
        searched={searched}
        onDeleteSelected={handleDeleteSelected}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
