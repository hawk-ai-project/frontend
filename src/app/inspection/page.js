// 현장점검 페이지 (frontend/src/app/inspection/page.js)

"use client";

import CameraPreview from "@/components/inspection/CameraPreview";
import InspectionInfo from "@/components/inspection/InspectionInfo";
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
        />
      </div>
    </div>
  );
}
