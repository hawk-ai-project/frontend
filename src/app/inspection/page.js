// 현장점검 페이지

"use client";

import CameraPreview from "@/components/inspection/CameraPreview";
import InspectionInfo from "@/components/inspection/InspectionInfo";

export default function InspectionPage() {
  return (
    <div className="page-shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Inspection</div>
          <h1>현장 점검</h1>
          <p className="subtitle">
            카메라 화면에서 원하는 시점을 촬영하고 AI 분석을 실행합니다.
          </p>
        </div>
      </div>

      <div className="inspection-grid">
        <CameraPreview />
        <InspectionInfo />
      </div>
    </div>
  );
}
