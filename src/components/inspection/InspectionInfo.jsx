// 점검 정보 컴포넌트 (inspection/InspectionInfo.jsx)

"use client";

import axios from "axios";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InspectionInfo({
  formData,
  setFormData,
  previewImage,
  submitting,
  setSubmitting,
  setSubmitError,
}) {
  const router = useRouter();

  useEffect(() => {
    const fetchMyName = async () => {
      try {
        const token = localStorage.getItem("hawk_ai_access_token");

        if (!token) {
          console.log("토큰이 없습니다. 로그인이 필요합니다.");
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData((prev) => ({
          ...prev,
          inspector: response.data.name,
        }));
      } catch (error) {
        console.error("점검자 정보를 가져오는데 실패했습니다.", error);
      }
    };
    fetchMyName();
  }, [setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 백엔드로 전달하는 함수
  const submitInspection = async () => {
    const location = formData.location?.trim();

    if (!previewImage) return setSubmitError("사진을 촬영하거나 첨부해주세요.");
    if (!location) return setSubmitError("점검 장소를 입력해주세요.");

    setSubmitting(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("hawk_ai_access_token");

      console.log("백엔드로 사진과 데이터 전송 시작!");

      // 백엔드의 /save API가 AI 분석까지
      const finalPayload = {
        title: `${location} 현장 점검`,
        location_name: location,
        address: formData.address || "",
        coordinates: formData.coordinates || "",
        notes: formData.memo || "",
        status: "REVIEW_REQUIRED",
        image: previewImage,
        ai_detections: [],
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/inspection/save",
        finalPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("백엔드 저장 완벽하게 성공!", response.data);
      alert("현장 점검이 등록되었습니다! 상세 페이지에서 확인하세요.");
    } catch (error) {
      console.error("에러 발생:", error);
      setSubmitError(
        error.response?.data?.detail || "점검 저장에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card card-pad" style={{ height: "100%" }}>
      <h3 className="section-title">점검 정보</h3>

      <div className="form-stack">
        <label htmlFor="location">
          점검 장소
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input"
            placeholder="도시명과 장소를 입력하세요"
          />
        </label>

        <label htmlFor="inspector">
          점검자
          <input
            type="text"
            id="inspector"
            name="inspector"
            value={formData.inspector}
            readOnly
            className="input"
            style={{
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              cursor: "not-allowed",
            }}
            placeholder="점검자를 불러오는 중..."
          />
        </label>

        <label htmlFor="memo">
          점검 메모
          <textarea
            id="memo"
            name="memo"
            value={formData.memo}
            onChange={handleChange}
            className="input"
            style={{ minHeight: "120px" }}
            placeholder="특이사항 등을 메모해 주세요"
          />
        </label>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={submitInspection}
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={submitting}
        >
          {submitting ? "분석 및 저장 중..." : "등록 및 분석하기"}
        </button>
      </div>
    </div>
  );
}
