// 점검 정보 컴포넌트 (inspection/InspectionInfo.jsx)

"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function InspectionInfo() {
  const [formData, setFormData] = useState({
    location: "",
    inspector: "",
    memo: "",
    status: "미처리",
  });

  useEffect(() => {
    const fetchMyName = async () => {
      try {
        // 일단 로컬에서 점검자 이름 불러오기
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
            placeholder="점검 장소를 입력하세요"
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

        <label htmlFor="status">
          처리 상태
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input"
          >
            <option value="미처리">미처리</option>
            <option value="처리 중">처리 중</option>
            <option value="처리 완료">처리 완료</option>
          </select>
        </label>
      </div>
    </div>
  );
}
