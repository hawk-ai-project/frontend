"use client";

import { useEffect, useState } from "react";
import { inspectionService } from "@/services/inspectionService";
import HistoryDetailClient from "./HistoryDetailClient";
import { STATUS_OPTIONS } from "./historyData";
import CommonLoading from "@/components/common/CommonLoading";

function toHistory(inspection) {
  const detections = Array.isArray(inspection.detections) ? inspection.detections : [];
  const statusMap = { REVIEW_REQUIRED: STATUS_OPTIONS[0], ACTION_REQUIRED: STATUS_OPTIONS[1], RESOLVED: STATUS_OPTIONS[2] };
  return {
    id: `INSPECTION-${inspection.id}`,
    inspectedAt: inspection.capturedAt,
    location: inspection.location || inspection.title,
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
    const urls = [];
    inspectionService.recent(100).then(async (items) => {
      const found = items.find((item) => Number(item.id) === Number(inspectionId));
      if (!found) throw new Error("not-found");
      const [original, annotated] = await Promise.allSettled([
        inspectionService.image(found.id, "ORIGINAL"),
        inspectionService.image(found.id, "ANNOTATED"),
      ]);
      if (cancelled) return;
      const originalImageUrl = original.status === "fulfilled" ? URL.createObjectURL(original.value) : null;
      const annotatedImageUrl = annotated.status === "fulfilled" ? URL.createObjectURL(annotated.value) : null;
      if (originalImageUrl) urls.push(originalImageUrl);
      if (annotatedImageUrl) urls.push(annotatedImageUrl);
      setInspection({ ...found, originalImageUrl, annotatedImageUrl });
    }).catch(() => { if (!cancelled) setError("점검 이력을 불러오지 못했습니다."); });
    return () => { cancelled = true; urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, [inspectionId]);

  if (error) return <p className="board-state board-state-error">{error}</p>;
  if (!inspection) return <CommonLoading message="점검 이력과 이미지를 불러오는 중..." />;
  const history = toHistory(inspection);
  const detail = {
    inspector: inspection.inspectorName,
    fullLocation: inspection.location || inspection.title,
    coordinates: inspection.coordinates || "",
    detections: (inspection.detections || []).map((item) => [item.className, item.count]),
    opinion: inspection.aiOpinion || inspection.notes || "탐지 결과를 확인하고 후속 조치를 작성해 주세요.",
    assigneeName: inspection.assigneeName || null,
    originalImageUrl: inspection.originalImageUrl,
    annotatedImageUrl: inspection.annotatedImageUrl,
  };
  return <HistoryDetailClient history={history} detail={detail} inspectionId={inspection.id} />;
}
