"use client";

import { useEffect, useState } from "react";
import { inspectionService } from "@/services/inspectionService";
import HistoryDetailClient from "./HistoryDetailClient";
import { STATUS_OPTIONS } from "./historyData";

function toHistory(inspection) {
  const detections = Array.isArray(inspection.detections) ? inspection.detections : [];
  const statusMap = {
    REVIEW_REQUIRED: STATUS_OPTIONS[0],
    ACTION_REQUIRED: STATUS_OPTIONS[1],
    RESOLVED: STATUS_OPTIONS[2],
  };
  return {
    id: `INSPECTION-${inspection.id}`,
    inspectedAt: inspection.capturedAt,
    location: inspection.location && inspection.location !== "미지정 위치"
      ? inspection.location
      : inspection.title,
    detectedCount: detections.reduce((total, item) => total + (Number(item.count) || 0), 0),
    waste: inspection.wasteSummary || detections.map((item) => item.className).join(", ") || "탐지 결과 없음",
    status: statusMap[inspection.status] || STATUS_OPTIONS[0],
  };
}

export default function LiveInspectionHistoryDetail({ inspectionId }) {
  const [inspection, setInspection] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    inspectionService.recent(10)
      .then((items) => {
        if (cancelled) return;
        const found = items.find((item) => Number(item.id) === Number(inspectionId));
        if (found) setInspection(found);
        else setError("점검 이력을 찾을 수 없습니다.");
      })
      .catch(() => {
        if (!cancelled) setError("점검 이력을 불러오지 못했습니다.");
      });
    return () => { cancelled = true; };
  }, [inspectionId]);

  if (error) return <p className="board-state board-state-error">{error}</p>;
  if (!inspection) return <p className="board-state">점검 이력을 불러오는 중입니다.</p>;

  const history = toHistory(inspection);
  const detail = {
    inspector: inspection.inspectorName,
    fullLocation: inspection.location && inspection.location !== "미지정 위치"
      ? inspection.location
      : inspection.title,
    coordinates: inspection.coordinates || "",
    detections: (inspection.detections || []).map((item) => [item.className, item.count]),
    opinion: inspection.aiOpinion || inspection.notes || "탐지 결과를 확인하고 현장 상황에 맞는 후속 조치를 작성해 주세요.",
  };
  detail.assigneeName = inspection.assigneeName || null;
  return <HistoryDetailClient history={history} detail={detail} inspectionId={inspection.id} />;
}
