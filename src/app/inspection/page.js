// 현장점검 페이지 (frontend/src/app/inspection/page.js)

"use client";

import CameraPreview from "@/components/inspection/CameraPreview";
import InspectionInfo from "@/components/inspection/InspectionInfo";
import ModelRecommendationCard from "@/components/ai/ModelRecommendationCard";
import { modelRecommendationService } from "@/services/modelRecommendationService";
import { getApiErrorMessage } from "@/services/apiClient";
import { useState } from "react";

export default function InspectionPage() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState({
    location: "",
    coordinates: "",
    inspector: "",
    memo: "",
    status: "DRAFT",
  });
  const [submitting, setSubmitting] = useState(false);
  const [, setSubmitError] = useState("");
  const [inspectionId, setInspectionId] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  const loadRecommendation = async (id = inspectionId) => {
    if (!id) return;
    setRecommendationLoading(true);
    setRecommendationError("");
    try {
      setRecommendation(
        await modelRecommendationService.recommendInspection(id),
      );
    } catch (error) {
      setRecommendationError(
        error.response?.status === 400
          ? "선정 후보 모델이 없습니다. 관리자 AI 관리에서 비교할 모델을 후보로 등록해 주세요."
          : getApiErrorMessage(error, "AI 모델 추천을 불러오지 못했습니다."),
      );
    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleInspectionCreated = (id) => {
    setInspectionId(id);
    void loadRecommendation(id);
  };

  // 캡쳐 시 좌표 저장
  const handleCaptureData = (imgUrl, coords) => {
    setCapturedImage(imgUrl);
    setFormData((prev) => ({
      ...prev,
      coordinates: coords || "위치 정보 없음",
    }));
  };

  return (
    <div className="page-shell">
      <div className="page-head">
        <div>
          {/* 맨 윗줄 소개 */}
          <div className="eyebrow">Inspection</div>
          <h1>현장 점검</h1>
          <p className="subtitle">
            카메라 화면에서 원하는 시점을 촬영하고 AI 분석을 실행합니다.
          </p>
        </div>
      </div>

      <div className="inspection-grid">
        {/* 현장 점검 */}
        <CameraPreview onCapture={handleCaptureData} />

        {/* 점검 정보) */}
        <InspectionInfo
          formData={formData}
          setFormData={setFormData}
          previewImage={capturedImage}
          submitting={submitting}
          setSubmitting={setSubmitting}
          setSubmitError={setSubmitError}
          onInspectionCreated={handleInspectionCreated}
        />
      </div>
      <ModelRecommendationCard
        recommendation={recommendation}
        loading={recommendationLoading}
        error={recommendationError}
        title="이 점검에 적합한 AI 모델"
        description="현재 이미지와 탐지 특성에 적합한 후보를 안내합니다."
        unavailable={
          !inspectionId
            ? "점검을 저장하거나 AI 분석을 완료하면 후보 모델 추천을 확인할 수 있습니다."
            : ""
        }
        onRefresh={inspectionId ? () => void loadRecommendation() : undefined}
      />
    </div>
  );
}
