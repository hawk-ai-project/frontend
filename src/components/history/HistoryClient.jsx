"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import HistoryHeader from "./HistoryHeader";
import HistoryList from "./HistoryList";
import { STATUS_OPTIONS } from "./historyData";
import { historyService } from "@/services/historyService";

export default function HistoryClient() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searched, setSearched] = useState(null);

  const wastes = useMemo(() => {
    return [
      ...new Set(
        items
          .flatMap((item) => item.wasteTypes || parseWasteTypes(item.waste))
          .filter((name) => name && name !== "탐지 결과 없음"),
      ),
    ].sort();
  }, [items]);

  const fetchHistories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await historyService.getHistories({ limit: 100 });
      const liveHistories = Array.isArray(data)
        ? data.map(inspectionToHistory).filter(Boolean)
        : [];
      setItems(liveHistories);
    } catch (err) {
      console.error("점검 이력 DB 조회 실패:", err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  const handleDeleteSelected = async (targetInspectionIds) => {
    if (!targetInspectionIds.length || isDeleting) return;

    setIsDeleting(true);
    try {
      await Promise.all(
        targetInspectionIds.map((id) => historyService.deleteHistory(id)),
      );
      await fetchHistories();
    } catch (error) {
      alert(
        error?.response?.data?.detail ||
          "점검 이력을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = (targetIds, bulkStatus) => {
    setItems((current) =>
      current.map((item) =>
        targetIds.includes(item.id) ? { ...item, status: bulkStatus } : item,
      ),
    );
  };

  return (
    <div className="page-shell">
      <div style={{ width: "100%", marginBottom: "24px" }}>
        <div className="page-head" style={{ marginBottom: "8px" }}>
          <div>
            <div className="eyebrow">HISTORY</div>
            <h1>점검 이력 조회</h1>
          </div>
          <Link href="/inspections/new" className="btn btn-primary">
            + 새 점검
          </Link>
        </div>
        <p className="subtitle" style={{ margin: 0 }}>
          수집된 점검 결과 및 폐기물 탐지 목록을 검색하고 상태를 변경할 수
          있습니다.
        </p>
      </div>

      <HistoryHeader onSearch={setSearched} wastes={wastes} />
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

function parseWasteTypes(wasteStr) {
  if (!wasteStr || typeof wasteStr !== "string") return [];
  return wasteStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function inspectionToHistory(inspection) {
  if (!inspection) return null;

  // 1. 점검 ID 및 점검번호 방어적 추출
  const rawId = inspection.id || inspection.inspectionId;
  const inspectionNo =
    inspection.inspectionNo &&
    String(inspection.inspectionNo).startsWith("INSPECTION-")
      ? inspection.inspectionNo
      : rawId
        ? `INSPECTION-${rawId}`
        : "-";

  // 2. detections 데이터 방어적 파싱 (배열 또는 JSON 문자열 대응)
  let detections = [];
  if (Array.isArray(inspection.detections)) {
    detections = inspection.detections;
  } else if (typeof inspection.detections === "string") {
    try {
      detections = JSON.parse(inspection.detections);
    } catch {
      detections = [];
    }
  }

  // 3. 탐지 수 계산 (수치 변환 및 카운트 합산 대응)
  const detectedCount =
    typeof inspection.detectionCount === "number"
      ? inspection.detectionCount
      : typeof inspection.detection_count === "number"
        ? inspection.detection_count
        : detections.reduce(
            (total, item) => total + (Number(item?.count) || 1),
            0,
          );

  // 4. 상태값 한글 매핑
  const statusMap = {
    DRAFT: "점검 대기",
    REVIEW_REQUIRED: "진행 대기",
    ACTION_REQUIRED: "진행",
    RESOLVED: "완료",
    FAILED: "분석 실패",
  };

  // 5. 주요 폐기물 추출 (detections 객체 배열 및 텍스트 파싱)
  const rawWasteString = inspection.wasteSummary || inspection.waste || "";
  const extractedFromText = parseWasteTypes(rawWasteString);

  const wasteNames = [
    ...new Set([
      ...detections
        .map((item) => item?.name_ko || item?.className)
        .filter(Boolean),
      ...extractedFromText,
    ]),
  ];

  const wasteText =
    wasteNames.length > 0 ? wasteNames.join(", ") : "탐지 결과 없음";

  return {
    id: inspectionNo,
    inspectionId: rawId,
    inspectedAt:
      inspection.capturedAt ||
      inspection.createdAt ||
      inspection.inspectedAt ||
      "-",
    location:
      inspection.location && inspection.location !== "미지정 위치"
        ? inspection.location
        : inspection.title || "위치 정보 없음",
    locationId: inspection.locationId || inspection.regionId,
    detectedCount,
    waste: wasteText,
    wasteTypes: wasteNames.length ? wasteNames : ["탐지 결과 없음"],
    status: statusMap[inspection.status] || inspection.status || "점검 대기",
  };
}
