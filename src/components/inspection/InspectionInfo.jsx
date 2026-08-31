// 점검 정보 컴포넌트 (inspection/InspectionInfo.jsx)

"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function InspectionInfo({
  formData,
  setFormData,
  previewImage,
  submitting,
  setSubmitting,
  setSubmitError,
}) {
  const router = useRouter();

  // 지도 관련 상태 및 Ref
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null); // { lat: number, lng: number }

  // 로그인 정보로 점검자 이름 자동 추가
  useEffect(() => {
    const fetchMyName = async () => {
      try {
        const token = localStorage.getItem("hawk_ai_access_token");
        if (!token) return;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
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

  // Leaflet CSS/JS 동적 로드 (Next.js SSR 안전 처리)
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!window.L) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => setIsMapReady(true);
        document.body.appendChild(script);
      } else {
        setIsMapReady(true);
      }
    }
  }, []);

  // 좌표(lat, lng)를 주소로 변환하는 공통 역지오코딩 함수
  const updateAddressFromCoords = async (lat, lng) => {
    try {
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&accept-language=ko`,
        { headers: { "User-Agent": "Hawk-Inspection-App" } },
      );

      // "도", "시", "구", "동" 조합
      const addr = geoResponse.data?.address;
      if (addr) {
        // 도 / 특별시 / 광역시 (예: 경기도, 서울특별시 등)
        const province = addr.province || addr.state || "";
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
        // 주소 조합 (예: 경기도 수원시 팔달구 화서동)
        const convertedAddress = `${province} ${city} ${borough} ${dong}`
          .trim()
          .replace(/\s+/g, " ");
        console.log("주소 변환 성공 (도/시/구/동):", convertedAddress);

        // 완성된 convertedAddress를 화면과 데이터에 즉시 꽂아주기
        setFormData((prev) => ({
          ...prev,
          // 비어있을 때만 자동 주소를 넣고, 수기로 적은 게 있으면 유지
          location: convertedAddress || prev.location,
          // address(DB 저장용)
          address: convertedAddress,
          coordinates: `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`,
        }));
      }
    } catch (error) {
      console.warn("좌표를 주소로 변환하는데 실패했습니다.", error);
    }
  };

  // formData.coordinates 변경 시 좌표 파싱 및 currentCoords 갱신
  useEffect(() => {
    if (formData.coordinates && !formData.coordinates.includes("없음")) {
      const numbers = formData.coordinates.match(/-?\d+(\.\d+)?/g);
      if (numbers && numbers.length >= 2) {
        const lat = parseFloat(numbers[0]);
        const lng = parseFloat(numbers[1]);
        setCurrentCoords({ lat, lng });

        // 주소가 비어있을 때만 최초 자동 변환
        if (!formData.address) {
          updateAddressFromCoords(lat, lng);
        }
      }
    }
  }, [formData.coordinates]);

  // Leaflet 인터랙티브 지도 초기화 및 마커 드래그/클릭 바인딩
  useEffect(() => {
    if (
      !isMapReady ||
      !mapContainerRef.current ||
      !currentCoords ||
      !window.L
    ) {
      return;
    }

    const { lat, lng } = currentCoords;
    const L = window.L;

    // 마커 기본 아이콘 깨짐 방지 설정
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // 지도 인스턴스가 없으면 생성
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // 드래그 가능한 마커 생성
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker
        .bindPopup("마커를 드래그하거나 지도를 클릭하여 위치를 조정하세요.")
        .openPopup();

      // 마커 드래그 종료 시 좌표 및 주소 갱신
      marker.on("dragend", (e) => {
        const position = e.target.getLatLng();
        updateAddressFromCoords(position.lat, position.lng);
      });

      // 지도 빈 곳 클릭 시 마커 이동 및 좌표/주소 갱신
      map.on("click", (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        updateAddressFromCoords(clickLat, clickLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      // 이미 지도가 존재하면 중심점과 마커 위치만 동기화
      mapInstanceRef.current.setView([lat, lng]);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [isMapReady, currentCoords]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // //  수동 탐지 리스트 핸들러 함수
  // const handleDetectionChange = (index, field, value) => {
  //   const newDetections = [...manualDetections];
  //   newDetections[index][field] = value;
  //   setManualDetections(newDetections);
  // };

  // // 줄 추가 함수
  // const addDetection = () => {
  //   setManualDetections([...manualDetections, { waste_type_id: "", count: 1 }]);
  // };

  // // 줄 삭제 함수
  // const removeDetection = (index) => {
  //   const newDetections = manualDetections.filter((_, i) => i !== index);
  //   setManualDetections(newDetections);
  // };

  // 백엔드로 점검 데이터 제출
  const submitInspection = async () => {
    // 장소명 앞뒤의 불필요한 공백 제거
    const location = formData.location?.trim();

    // 유효성 검증: 사진 첨부 여부, 장소 입력 여부 확인
    if (!previewImage) {
      alert("캡쳐버튼을 누르거나 사진을 첨부해주세요.");
      return setSubmitError("사진을 촬영하거나 첨부해주세요.");
    }
    // 장소명이 없을 경우 전송 차단
    if (!location) return setSubmitError("점검 장소를 입력해주세요.");

    // 통신 준비 및 로딩 상태 활성화
    setSubmitting(true);

    // 이전에 발생한 에러메시지 초기화
    setSubmitError("");

    try {
      // 로그인 시 저장한 JWT 인증 토큰 가져오기
      const token = localStorage.getItem("hawk_ai_access_token");
      console.log("백엔드로 사진과 데이터 전송 시작!");

      const convertedAddress = formData.address || "";

      // 백엔드의 /save API로 전달할 내용
      const finalPayload = {
        title: `${location} 현장 점검`,
        location_name: location,
        address: convertedAddress,
        coordinates: formData.coordinates || "",
        notes: formData.memo || "",
        status: "DRAFT",
        image: previewImage,
        ai_detections: [],
        detections: [],
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
      // 점검 등록 완료 알림창
      alert("현장 점검이 등록되었습니다! 점검 상세 페이지로 이동합니다.");

      // 생성된 점검 ID 확인
      const newInspectionId = response.data.inspectionId || response.data.id;

      // 등록 완료 시 해당 점검 상세 페이지로 바로 이동
      if (newInspectionId) {
        router.push(`/reinspections/${newInspectionId}`);
      } else {
        router.push("/reinspections");
      }

      // try에서 에러 발생 시
    } catch (error) {
      console.error("에러 발생:", error);
      setSubmitError(
        error.response?.data?.detail || "점검 저장에 실패했습니다.",
      );

      // 전송 성공/실패여부와 상관 없이 실행하려 버튼의 로딩 상태 해제
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card card-pad" style={{ height: "100%" }}>
      <h3 className="section-title">점검 정보</h3>

      <div className="form-stack">
        <label htmlFor="inspector">
          점검자
          <input
            type="text"
            id="inspector"
            name="inspector"
            value={formData.inspector || ""}
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

        <label htmlFor="location">
          점검 장소
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
            className="input"
            placeholder="도시명과 장소를 입력하세요"
          />
        </label>

        {/* 인터랙티브 위치 미세 조정 지도 영역 */}
        {currentCoords && (
          <div style={{ marginTop: "12px", marginBottom: "8px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                위치 세부 조정
              </span>
              <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                {formData.coordinates}
              </span>
            </div>
            <div
              ref={mapContainerRef}
              style={{
                height: "220px",
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                zIndex: 0,
              }}
            />
          </div>
        )}

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
            value={formData.memo || ""}
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
