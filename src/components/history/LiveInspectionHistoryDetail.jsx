"use client";

import { useEffect, useState } from "react";
import { historyService } from "@/services/historyService";
import { getApiErrorMessage } from "@/services/apiClient";
import HistoryDetailClient from "./HistoryDetailClient";
import { STATUS_OPTIONS } from "./historyData";
import CommonLoading from "@/components/common/CommonLoading";

function toHistory(inspection) {
  const detections = Array.isArray(inspection.detections)
    ? inspection.detections
    : [];
  const statusMap = {
    DRAFT: "점검 대기",
    REVIEW_REQUIRED: "진행 대기",
    ACTION_REQUIRED: "진행",
    RESOLVED: "완료",
    FAILED: "분석 실패",
  };
  return {
    id: `INSPECTION-${inspection.id}`,
    inspectedAt: inspection.capturedAt,
    location: inspection.location || inspection.title,
    detectedCount: detections.reduce(
      (total, item) => total + (Number(item.count) || 0),
      0,
    ),
    waste:
      inspection.wasteSummary ||
      detections
        .map((item) => item.name_ko || item.className || item.name)
        .filter(Boolean)
        .join(", ") ||
      "탐지 결과 없음",
    status: statusMap[inspection.status] || STATUS_OPTIONS[0],
  };
}

export default function LiveInspectionHistoryDetail({ inspectionId }) {
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const urls = [];

    setLoading(true);

    historyService
      .getHistoryById(inspectionId)
      .then(async (found) => {
        if (!found) throw new Error("해당 점검 이력을 찾을 수 없습니다.");

        const [original, annotated] = await Promise.allSettled([
          historyService.getHistoryImage(found.id, "ORIGINAL"),
          historyService.getHistoryImage(found.id, "ANNOTATED"),
        ]);

        if (cancelled) return;

        const originalImageUrl =
          original.status === "fulfilled"
            ? URL.createObjectURL(original.value)
            : null;
        const annotatedImageUrl =
          annotated.status === "fulfilled"
            ? URL.createObjectURL(annotated.value)
            : null;

        if (originalImageUrl) urls.push(originalImageUrl);
        if (annotatedImageUrl) urls.push(annotatedImageUrl);

        setInspection({ ...found, originalImageUrl, annotatedImageUrl });
        setError("");
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              "점검 이력을 불러오지 못했습니다.",
            ),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [inspectionId]);

  if (loading)
    return <CommonLoading message="점검 이력과 이미지를 불러오는 중..." />;
  if (error) return <p className="board-state board-state-error">{error}</p>;

  const history = toHistory(inspection);
  const detail = {
    inspector: inspection.inspectorName,
    fullLocation: inspection.location || inspection.title,
    coordinates: inspection.coordinates || "",
    // DB의 name_ko, className, name 모두 대응하여 [이름, 수량] 형태로 안전하게 전달
    detections: (inspection.detections || []).map((item) => [
      item.name_ko || item.className || item.name || "폐기물",
      Number(item.count) || 1,
    ]),
    wasteSummary: inspection.wasteSummary || history.waste,
    opinion:
      inspection.aiOpinion ||
      inspection.notes ||
      "탐지 결과를 확인하고 후속 조치를 작성해 주세요.",
    assigneeName: inspection.assigneeName || null,
    originalImageUrl: inspection.originalImageUrl,
    annotatedImageUrl: inspection.annotatedImageUrl,
  };

  return (
    <HistoryDetailClient
      history={history}
      detail={detail}
      inspectionId={inspection.id}
    />
  );
}
