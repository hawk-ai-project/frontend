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
  const selectedMarkerRef = useRef(null);
  const geocoderRef = useRef(null);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null); // { lat: number, lng: number }

  // 지오코딩 무한 루프 방지용 플래그
  const isUpdatingFromMap = useRef(false);

  // 실제 기기 GPS 위치 보관용 (최초 1회 저장)
  const initialGpsCoordsRef = useRef(null);

  // 실제 GPS 위치를 표시할 원 마커
  const gpsMarkerRef = useRef(null);

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

  // Google Maps JavaScript API SDK 동적 로드
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google && window.google.maps) {
      setIsGoogleMapsReady(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("구글 맵 API 키가 설정되지 않았습니다.");
      return;
    }

    const existingScript = document.getElementById("google-maps-sdk");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-maps-sdk";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=ko`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleMapsReady(true);
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener("load", () => setIsGoogleMapsReady(true));
    }
  }, []);

  // 구글 Geocoder 응답에서 순수 표준 도로명/지번 주소만 추출 (상호명/괄호/국가명/우편번호 제외)
  const extractCleanStandardAddress = (results) => {
    if (!results || results.length === 0) return "";

    // 순수 도로명/지번 주소 타입(street_address, premise, route)을 최우선으로 선택
    const standardItem =
      results.find((item) => item.types.includes("street_address")) ||
      results.find((item) => item.types.includes("premise")) ||
      results.find((item) => item.types.includes("route")) ||
      results[0];

    // 구글 공식 완성형 주소 (예: "대한민국 경기도 수원시 장안구 수성로 175" 또는 "대한민국 경기도 수원시 장안구 정자동 111")
    let cleanAddress = standardItem.formatted_address || "";

    // '대한민국', 5자리 우편번호, 괄호 내용(상호명 등) 제거
    cleanAddress = cleanAddress
      .replace(/^대한민국\s*/, "") // 국가명 제거
      .replace(/\b\d{5}\b/g, "") // 5자리 우편번호 제거
      .replace(/\s*\([^)]*\)/g, "") // 괄호 및 괄호 안 내용 (예: (정자동), (스타필드) 등) 제거
      .trim()
      .replace(/\s+/g, " "); // 다중 공백 정리

    return cleanAddress;
  };

  // 역지오코딩 (좌표 -> 표준 도로명 주소 변환)
  const updateAddressFromCoords = (lat, lng) => {
    if (!window.google?.maps) return;

    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    const latlng = { lat: Number(lat), lng: Number(lng) };

    geocoderRef.current.geocode(
      { location: latlng, language: "ko" },
      (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const standardAddress = extractCleanStandardAddress(results);

          console.log("표준 주소 변환 성공:", standardAddress);

          isUpdatingFromMap.current = true;
          setFormData((prev) => ({
            ...prev,
            // location과 address 모두 '경기도 수원시 장안구 수성로 175' 형태로 저장
            location: standardAddress || prev.location,
            address: standardAddress,
            coordinates: `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`,
          }));
        } else {
          console.warn("구글 역지오코딩 실패:", status);
        }
      },
    );
  };

  // 정방향 지오코딩 ('스타필드 수원' 등 검색 시 좌표 및 표준 주소 매핑)
  const searchCoordsFromAddress = (keyword) => {
    if (!keyword || keyword.trim().length < 2 || !window.google?.maps) return;

    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    geocoderRef.current.geocode(
      { address: keyword.trim(), region: "kr", language: "ko" },
      (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const location = results[0].geometry.location;
          const newLat = location.lat();
          const newLng = location.lng();

          // 장소명을 검색해도 실제 등록되는 주소는 '경기도 수원시 장안구 수성로 175'로 변환
          const standardAddress = extractCleanStandardAddress(results);

          setCurrentCoords({ lat: newLat, lng: newLng });

          setFormData((prev) => ({
            ...prev,
            coordinates: `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`,
            location: standardAddress || prev.location,
            address: standardAddress,
          }));

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: newLat, lng: newLng });
            mapInstanceRef.current.setZoom(17);
          }
          if (selectedMarkerRef.current) {
            selectedMarkerRef.current.setPosition({ lat: newLat, lng: newLng });
          }
        }
      },
    );
  };

  // 사용자가 '점검 장소'를 직접 타이핑할 때 디바운스(0.6초) 검색
  useEffect(() => {
    // 지도에서 역지오코딩으로 채워진 주소라면 검색을 스킵
    if (isUpdatingFromMap.current) {
      isUpdatingFromMap.current = false;
      return;
    }

    if (!formData.location || formData.location.trim().length < 2) return;

    const timer = setTimeout(() => {
      searchCoordsFromAddress(formData.location);
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.location]);

  // 페이지 진입 즉시 브라우저 GPS로 현재 위치 자동 감지
  useEffect(() => {
    // 이미 좌표가 설정되어 있지 않은 경우에만 브라우저 Geolocation 실행
    if (!formData.coordinates && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // 최초 실제 GPS 위치 저장
          initialGpsCoordsRef.current = { lat, lng };

          setCurrentCoords({ lat, lng });
          updateAddressFromCoords(lat, lng);
        },
        (error) => {
          console.warn(
            "브라우저 위치 정보를 가져올 수 없습니다:",
            error.message,
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }
  }, []);

  // 두 좌표 간 직선 거리(미터) 계산 및 100m 오차 경고 함수
  const checkLocationDistance = (selectedLat, selectedLng) => {
    if (!initialGpsCoordsRef.current || !window.google?.maps?.geometry) return;

    const { lat: gpsLat, lng: gpsLng } = initialGpsCoordsRef.current;
    const gpsLatLng = new window.google.maps.LatLng(gpsLat, gpsLng);
    const selectedLatLng = new window.google.maps.LatLng(
      selectedLat,
      selectedLng,
    );

    const distanceInMeters = Math.round(
      window.google.maps.geometry.spherical.computeDistanceBetween(
        gpsLatLng,
        selectedLatLng,
      ),
    );

    const THRESHOLD_METERS = 100;

    if (distanceInMeters > THRESHOLD_METERS) {
      const distanceDisplay =
        distanceInMeters >= 1000
          ? `${(distanceInMeters / 1000).toFixed(1)}km`
          : `${distanceInMeters}m`;

      alert(
        `현재 실제 위치와 약 ${distanceDisplay} 떨어진 곳을 지정하셨습니다.\n선택하신 위치가 맞는지 확인해 주세요.`,
      );
    }
  };

  // Google Maps 초기화 및 마커 렌더링
  useEffect(() => {
    if (
      !isGoogleMapsReady ||
      !mapContainerRef.current ||
      !currentCoords ||
      !window.google?.maps
    ) {
      return;
    }

    const { lat, lng } = currentCoords;
    const center = { lat, lng };

    // 최초 맵 생성
    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 17,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // (A) 실제 내 기기 위치 파란색 마커
      const gpsCoords = initialGpsCoordsRef.current || { lat, lng };
      const gpsMarker = new window.google.maps.Marker({
        position: gpsCoords,
        map,
        title: "현재 실제 위치",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2.5,
        },
      });
      gpsMarkerRef.current = gpsMarker;

      // (B) 선택된 점검 위치 빨간색 핀 마커 (드래그 가능)
      const selectedMarker = new window.google.maps.Marker({
        position: center,
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: "점검 위치",
      });

      // 마커 드래그 완료 이벤트
      selectedMarker.addListener("dragend", (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setCurrentCoords({ lat: newLat, lng: newLng });
        updateAddressFromCoords(newLat, newLng);
        checkLocationDistance(newLat, newLng);
      });

      // 지도 빈 곳 클릭 이벤트
      map.addListener("click", (e) => {
        const clickLat = e.latLng.lat();
        const clickLng = e.latLng.lng();
        selectedMarker.setPosition({ lat: clickLat, lng: clickLng });
        setCurrentCoords({ lat: clickLat, lng: clickLng });
        updateAddressFromCoords(clickLat, clickLng);
        checkLocationDistance(clickLat, clickLng);
      });

      mapInstanceRef.current = map;
      selectedMarkerRef.current = selectedMarker;
    } else {
      mapInstanceRef.current.setCenter(center);
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setPosition(center);
      }
    }
  }, [isGoogleMapsReady, currentCoords]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
