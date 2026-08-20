"use client";

import { useEffect, useState } from "react";

export default function AnalyticsMap({ items = [] }) {
  // GPS 좌표 유효성 검사
  const validItems = items.filter(
    (item) =>
      (item.latitude || item.lat) &&
      (item.longitude || item.lng) &&
      Number(item.latitude || item.lat) !== 0,
  );

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (validItems.length === 0 && typeof window !== "undefined") {
      // 1. 현장점검 화면 등에서 저장해둔 좌표(localStorage)가 있는지 우선 확인
      const savedLocation = localStorage.getItem("lastInspectionLocation"); // 필요 시 저장 키 이름 수정
      if (savedLocation) {
        try {
          const parsed = JSON.parse(savedLocation);
          if (parsed.lat && parsed.lng) {
            setUserLocation({ lat: parsed.lat, lng: parsed.lng });
            return;
          }
        } catch (e) {
          console.warn("저장된 위치 파싱 실패:", e);
        }
      }

      // 2. 저장된 위치가 없으면 브라우저 고정밀 GPS 수집
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          (err) => console.warn("현재 위치 로드 실패:", err),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }, // 고정밀 위치 옵션
        );
      }
    }
  }, [validItems.length]);

  // 지도 좌표 순위: 1. 조회 데이터 좌표 -> 2. 현장점검 저장/GPS 좌표 -> 3. 기본 좌표
  const targetLat =
    validItems[0]?.latitude ||
    validItems[0]?.lat ||
    userLocation?.lat ||
    37.5665;
  const targetLng =
    validItems[0]?.longitude ||
    validItems[0]?.lng ||
    userLocation?.lng ||
    126.978;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const mapSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${targetLat},${targetLng}&zoom=14`
    : `https://maps.google.com/maps?q=${targetLat},${targetLng}&z=14&output=embed`;

  return (
    <div className="card card-pad" style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
          탐지 위치 지도 분포
        </h3>
        <span style={{ fontSize: "14px", color: "#64748b" }}>
          {validItems.length > 0 ? (
            <>
              총 <b style={{ color: "#0f172a" }}>{validItems.length}</b>개 위치
              표시 중
            </>
          ) : (
            <span style={{ color: "#6366f1", fontWeight: "600" }}>
              조회 데이터 없음 (기준 위치)
            </span>
          )}
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#f8fafc",
        }}
      >
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapSrc}
        />
      </div>
    </div>
  );
}
