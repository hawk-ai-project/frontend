// 점검 정보 컴포넌트 (inspection/InspectionInfo.jsx)

"use client";

import { useState } from "react";

export default function InspectionInfo() {
  const [formData, setFormData] = useState({
    location: "부산 해운대 해수욕장 동측",
    inspector: "김도하",
    memo: "방파제 인근 수면과 해안선 중심으로 점검",
    status: "미처리",
  });

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
            onChange={handleChange}
            className="input"
            placeholder="점검자를 입력하세요"
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
