// 점검 정보 컴포넌트 (inspection/InspectionInfo.jsx)

"use client";

import axios from "axios";
import { useEffect, useState } from "react";
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
  // 폐기물 목록
  const [wasteTypes, setWasteTypes] = useState([]);
  // 수동 탐지 데이터 관리
  const [manualDetections, setManualDetections] = useState([
    { waste_type_id: "", count: 1 },
  ]);

  // 컴포넌트 마운트 시 백엔드에서 폐기물 종류 목록 불러오기
  useEffect(() => {
    const fetchWasteTypes = async () => {
      try {
        const token = localStorage.getItem("hawk_ai_access_token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/waste_types`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setWasteTypes(response.data);
      } catch (error) {
        console.error("폐기물 목록을 불러오는데 실패했습니다.", error);
      }
    };
    fetchWasteTypes();
  }, []);

  useEffect(() => {
    const fetchMyName = async () => {
      try {
        const token = localStorage.getItem("hawk_ai_access_token");

        if (!token) {
          console.log("토큰이 없습니다. 로그인이 필요합니다.");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
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

  // 점검장소 자동추가
  useEffect(() => {
    const fetchAddressFromCoords = async () => {
      let convertedAddress = formData.address || "";

      // 좌표가 존재하고, 아직 주소가 없으며, 에러 메시지가 아닐 때만 실행
      if (
        formData.coordinates &&
        !formData.coordinates.includes("없음") &&
        !convertedAddress
      ) {
        // 변환하는 동안
        setFormData((prev) => ({
          ...prev,
          location: prev.location ? prev.location : "위치 정보 변환 중...",
        }));

        try {
          // 1. 글자가 섞여 있어도 숫자만 2개 뽑기 (위도, 경도)
          const numbers = formData.coordinates.match(/-?\d+(\.\d+)?/g);

          // 위도, 경도 들어왔는지 확인
          if (numbers && numbers.length >= 2) {
            const lat = numbers[0]; // 위도
            const lng = numbers[1]; // 경도

            // 2. zoom=16 옵션으로 '동(마을)' 수준까지 검색
            const geoResponse = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&accept-language=ko`,
              {
                headers: { "User-Agent": "Hawk-Inspection-App" },
              },
            );

            // 3. "시", "구", "동" 조합
            const addr = geoResponse.data?.address;
            if (addr) {
              // 시
              const city = addr.city || addr.town || "";
              // 구
              const borough =
                addr.city_district ||
                addr.borough ||
                addr.district ||
                addr.county ||
                "";
              // 동
              const dong =
                addr.suburb ||
                addr.quarter ||
                addr.neighbourhood ||
                addr.village ||
                "";

              // 주소 조합 (예: 수원시 팔달구 화서동)
              convertedAddress = `${city} ${borough} ${dong}`
                .trim()
                .replace(/\s+/g, " ");
              console.log("주소 변환 성공 (시/구/동):", convertedAddress);

              // 완성된 convertedAddress를 화면과 데이터에 즉시 꽂아주기
              setFormData((prev) => {
                const isLocationEmpty =
                  !prev.location || prev.location === "위치 정보 변환 중...";
                return {
                  ...prev,
                  // 비어있을 때만 자동 주소를 넣고, 수기로 적은 게 있으면 유지
                  location: isLocationEmpty ? convertedAddress : prev.location,
                  // address(DB 저장용)
                  address: convertedAddress,
                };
              });
            }
          } else {
            console.warn(
              "좌표에서 숫자를 찾을 수 없습니다:",
              formData.coordinates,
            );
            // 실패 시 다시 빈칸으로 돌려놓기
            setFormData((prev) => ({ ...prev, location: "" }));
          }
        } catch (geoError) {
          console.warn(
            "좌표를 주소로 변환하는데 실패했습니다.",
            geoError.message,
          );
          // 실패 시 다시 빈칸으로 돌려놓기
          setFormData((prev) => ({ ...prev, location: "" }));
        }
      }
    };

    fetchAddressFromCoords();
  }, [formData.coordinates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  수동 탐지 리스트 핸들러 함수
  const handleDetectionChange = (index, field, value) => {
    const newDetections = [...manualDetections];
    newDetections[index][field] = value;
    setManualDetections(newDetections);
  };

  // 줄 추가 함수
  const addDetection = () => {
    setManualDetections([...manualDetections, { waste_type_id: "", count: 1 }]);
  };

  // 줄 삭제 함수
  const removeDetection = (index) => {
    const newDetections = manualDetections.filter((_, i) => i !== index);
    setManualDetections(newDetections);
  };

  // 백엔드로 전달하는 함수
  const submitInspection = async () => {
    const location = formData.location?.trim();

    if (!previewImage) {
      alert("캡쳐버튼을 누르거나 사진을 첨부해주세요.");
      return setSubmitError("사진을 촬영하거나 첨부해주세요.");
    }
    if (!location) return setSubmitError("점검 장소를 입력해주세요.");

    setSubmitting(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("hawk_ai_access_token");

      console.log("백엔드로 사진과 데이터 전송 시작!");

      let convertedAddress = formData.address || "";

      // 빈 값을 걸러내고, 숫자형으로 변환하여 백엔드가 원하는 포맷으로 맞춤
      const validDetections = manualDetections
        .filter((d) => d.waste_type_id !== "")
        .map((d) => ({
          waste_type_id: Number(d.waste_type_id),
          count: Number(d.count),
        }));

      // 백엔드의 /save API로 전달할 내용
      const finalPayload = {
        title: `${location} 현장 점검`,
        location_name: location,
        address: convertedAddress,
        coordinates: formData.coordinates || "",
        notes: formData.memo || "",
        status: "REVIEW_REQUIRED",
        image: previewImage,
        ai_detections: [],
        detections: validDetections, // 수동 입력 데이터 추가
      };

      // 백엔드로 보내기
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/inspection/save`,
        finalPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("백엔드 저장 완벽하게 성공!", response.data);
      alert("현장 점검이 등록되었습니다! 점검이력 페이지로 이동합니다.");

      // 지금 만든 점검번호 꺼내기
      const newInspectionId = response.data.inspectionId;

      // 해당 점검번호 상페 페이지로 이동
      if (newInspectionId) {
        router.push(`/histories/${newInspectionId}`);
      } else {
        // 혹시 번호가 없을경우 전체 목록으로 이동
        router.push("/histories");
      }
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
            placeholder="로그인 후 이용해주세요"
          />
        </label>

        {/* 수동 폐기물 입력 UI 영역 */}
        {/* <div style={{ marginTop: "10px", marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            수동 탐지 결과 (선택)
          </label>
          {manualDetections.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "10px",
                alignItems: "center",
              }}
            > */}
        {/* 폐기물 종류 선택 드롭다운 */}
        {/* <select
                value={item.waste_type_id}
                onChange={(e) =>
                  handleDetectionChange(index, "waste_type_id", e.target.value)
                }
                className="input"
                style={{ flex: 5 }}
              >
                <option value="">폐기물 종류</option>
                {wasteTypes.map((wt) => (
                  <option key={wt.id} value={wt.id}> */}
        {/* 한글 이름으로 출력 */}
        {/* {wt.name_ko}
                  </option>
                ))}
              </select> */}

        {/* 수량 입력 */}
        {/* <input
                type="number"
                min="1"
                value={item.count}
                onChange={(e) =>
                  handleDetectionChange(index, "count", e.target.value)
                }
                className="input"
                style={{ flex: 1 }}
                placeholder="수량"
              /> */}

        {/* 삭제 버튼 (2개 이상일때부터 등장) */}
        {/* {manualDetections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDetection(index)}
                  className="btn btn-secondary"
                  style={{ padding: "0 6px" }}
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDetection}
            className="btn btn-soft"
            style={{ width: "100%", fontSize: "0.9rem" }}
          >
            + 폐기물 추가하기
          </button>
        </div> */}

        <label htmlFor="memo">
          점검 메모
          <textarea
            id="memo"
            name="memo"
            value={formData.memo}
            onChange={handleChange}
            className="input"
            style={{ minHeight: "50px" }}
            placeholder="특이사항을 메모해 주세요"
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
