// 현장점검 페이지 (frontend/src/app/inspection/page.js)

import CameraPreview from "@/components/inspection/CameraPreview";
import InspectionInfo from "@/components/inspection/InspectionInfo";
export const metadata = { title: "현장점검" };

export default function InspectionPage() {
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
        <CameraPreview />

        {/* 점검 정보) */}
        <InspectionInfo />
      </div>
    </div>
  );
}
