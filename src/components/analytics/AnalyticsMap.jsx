"use client";

import { useEffect, useRef, useState } from "react";

export default function AnalyticsMap({ items = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const validItems = items.filter((item) => {
    const hasValidGps =
      (item.latitude || item.lat) &&
      (item.longitude || item.lng) &&
      Number(item.latitude || item.lat) !== 0;

    // 백엔드에서 내려주는 count 필드 확인
    const wasteCount = Number(
      item.waste_count ?? item.detection_count ?? item.count ?? 0,
    );

    return hasValidGps && wasteCount > 0;
  });

  const [userLocation, setUserLocation] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 1. 사용자 기준 위치(GPS) 확보
  useEffect(() => {
    if (validItems.length === 0 && typeof window !== "undefined") {
      const savedLocation = localStorage.getItem("lastInspectionLocation");
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

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          (err) => console.warn("현재 위치 로드 실패:", err),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
        );
      }
    }
  }, [validItems.length]);

  // 2. Google Maps JS API 스크립트 동적 로드
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 환경변수가 필요합니다.");
      return;
    }

    if (window.google && window.google.maps) {
      setIsMapLoaded(true);
      return;
    }

    const scriptId = "google-maps-js-api";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapLoaded(true);
      document.head.appendChild(script);
    } else {
      const script = document.getElementById(scriptId);
      script.addEventListener("load", () => setIsMapLoaded(true));
    }
  }, []);

  // 3. 지도 인스턴스 생성 및 마커 다중 표시
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.google) return;

    // 기본 중심 좌표 설정
    const defaultLat =
      validItems[0]?.latitude ||
      validItems[0]?.lat ||
      userLocation?.lat ||
      37.5665;
    const defaultLng =
      validItems[0]?.longitude ||
      validItems[0]?.lng ||
      userLocation?.lng ||
      126.978;

    // 지도 객체 초기화 (1회)
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: Number(defaultLat), lng: Number(defaultLng) },
        zoom: 12,
      });
    }

    const map = mapInstanceRef.current;

    // 기존 그려진 마커 초기화
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 데이터 위치에 따른 마커 찍기
    if (validItems.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();

      validItems.forEach((item) => {
        const lat = Number(item.latitude || item.lat);
        const lng = Number(item.longitude || item.lng);
        const position = { lat, lng };

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: item.name || item.address || "점검 장소",
        });

        // 마커 클릭 시 정보창 바인딩
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 4px; color: #0f172a;">
              <strong style="font-size: 14px;">${item.name || item.address || "점검 위치"}</strong>
              ${
                item.count
                  ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">점검/탐지 건수: ${item.count}건</p>`
                  : ""
              }
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      });

      // 마커가 여러 개일 경우 화면에 모두 들어오도록 구역(Bounds) 자동 맞춤
      if (validItems.length > 1) {
        map.fitBounds(bounds);
      } else {
        map.setCenter({
          lat: Number(validItems[0].latitude || validItems[0].lat),
          lng: Number(validItems[0].longitude || validItems[0].lng),
        });
        map.setZoom(14);
      }
    } else {
      map.setCenter({ lat: Number(defaultLat), lng: Number(defaultLng) });
      map.setZoom(12);
    }
  }, [isMapLoaded, validItems, userLocation]);

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
        ref={mapRef}
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#f8fafc",
        }}
      />
    </div>
  );
}
