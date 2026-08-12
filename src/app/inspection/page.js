// 현장점검 페이지 (frontend/src/app/inspection/page.js)

"use client";

import CameraPreview from "@/components/inspection/CameraPreview";
import InspectionInfo from "@/components/inspection/InspectionInfo";
import axios from "axios";
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

  const handleCaptureData = (imgUrl, coords) => {
    setCapturedImage(imgUrl);
    setFormData((prev) => ({
      ...prev,
      coordinates: coords || "위치 정보 없음",
    }));
  };

  const handleSubmit = async (imgUrl, coords, fetchedAddress) => {
    if (!imgUrl) {
      alert("현장 사진을 먼저 촬영하거나 첨부해 주세요!");
      return;
    }
    if (!formData.location) {
      alert("점검 장소를 수기로 입력해 주세요!");
      return;
    }

    try {
      // AI 분석 먼저 요청
      console.log("AI 분석 요청 시작...");
      // const aiResponse = await axios.post(
      //   "http://127.0.0.1:8000/api/inspection/analyze",
      //   {
      //     image: capturedImage,
      //   },
      // );

      // console.log("AI 분석 결과:", aiResponse.data);

      // DB 저장용
      const finalPayload = {
        title: `${formData.location} 현장 점검`,
        location_name: formData.location,
        address: fetchedAddress || formData.address || "",
        coordinates: coords || formData.coordinates,
        notes: formData.memo,
        status: formData.status,
        image: imgUrl,
        ai_detections: [],
      };

      const token = localStorage.getItem("hawk_ai_access_token");
      await axios.post(
        "http://127.0.0.1:8000/api/inspection/save",
        finalPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("등록이 완료됐습니다! 점검이력 페이지에서 확인하세요.");
    } catch (error) {
      console.error("전송 중 에러 발생:", error);
      alert("백엔드 통신 중 에러가 발생했습니다.");
    }
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
        <CameraPreview onCapture={handleCaptureData} onSubmit={handleSubmit} />

        {/* 점검 정보) */}
        <InspectionInfo formData={formData} setFormData={setFormData} />
      </div>
    </div>
  );
}
