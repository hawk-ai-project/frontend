"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsMap({ items = [], trends = [], query = {} }) {
  const router = useRouter();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clustererRef = useRef(null);
  const markersRef = useRef([]);

  // ★ 차트의 trends 데이터를 YYYY.MM.DD 및 건수 목록으로 변환
  const chartDateList = trends
    .map((t) => {
      if (!t.date || !t.date.includes("/")) return null;
      const [monthStr, dayStr] = t.date.split("/");
      const formattedMMDD = `${monthStr.padStart(2, "0")}-${dayStr.padStart(2, "0")}`;

      const startYear = query.startDate
        ? parseInt(query.startDate.split("-")[0], 10)
        : new Date().getFullYear();
      const endYear = query.endDate
        ? parseInt(query.endDate.split("-")[0], 10)
        : startYear;

      let targetYear = startYear;
      for (let year = startYear; year <= endYear; year++) {
        const candidateDate = `${year}-${formattedMMDD}`;
        const isAfterStart =
          !query.startDate || candidateDate >= query.startDate;
        const isBeforeEnd = !query.endDate || candidateDate <= query.endDate;

        if (isAfterStart && isBeforeEnd) {
          targetYear = year;
          break;
        }
      }

      return {
        formattedDate: `${targetYear}.${formattedMMDD.replace("-", ".")}`,
        count: Number(t.count ?? 1),
      };
    })
    .filter(Boolean);

  const validItems = items.filter((item) => {
    const hasValidGps =
      (item.latitude || item.lat) &&
      (item.longitude || item.lng) &&
      Number(item.latitude || item.lat) !== 0;

    const wasteCount = Number(
      item.waste_count ?? item.detection_count ?? item.count ?? 0,
    );

    return hasValidGps && wasteCount > 0;
  });

  // 동일 좌표(위도, 경도) 데이터를 그룹화하면서 날짜별 항목 분할
  const groupedItems = validItems.reduce((acc, item) => {
    const lat = Number(item.latitude || item.lat).toFixed(6);
    const lng = Number(item.longitude || item.lng).toFixed(6);
    const key = `${lat}_${lng}`;

    if (!acc[key]) {
      acc[key] = {
        lat: Number(lat),
        lng: Number(lng),
        name: item.name || item.address || "점검 위치",
        address: item.address || item.region_name || "-",
        totalCount: 0,
        list: [],
      };
    }

    const totalCountVal = Number(
      item.count ?? item.waste_count ?? item.detection_count ?? 1,
    );
    acc[key].totalCount += totalCountVal;

    // ★ trends 데이터가 존재할 경우 일자별로 리스트 생성
    if (chartDateList.length > 0) {
      chartDateList.forEach((t) => {
        acc[key].list.push({
          ...item,
          countVal: t.count,
          assignedDate: t.formattedDate,
        });
      });
    } else {
      acc[key].list.push({
        ...item,
        countVal: totalCountVal,
        assignedDate: query.startDate
          ? query.startDate.replace(/-/g, ".")
          : "-",
      });
    }

    return acc;
  }, {});

  const groupedList = Object.values(groupedItems);

  const [userLocation, setUserLocation] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 환경변수가 필요합니다.");
      return;
    }

    const loadClustererScript = () => {
      if (window.markerClusterer) {
        setIsMapLoaded(true);
        return;
      }
      const clusterScript = document.createElement("script");
      clusterScript.src =
        "https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js";
      clusterScript.async = true;
      clusterScript.onload = () => setIsMapLoaded(true);
      document.head.appendChild(clusterScript);
    };

    if (window.google && window.google.maps) {
      loadClustererScript();
      return;
    }

    const scriptId = "google-maps-js-api";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => loadClustererScript();
      document.head.appendChild(script);
    } else {
      const script = document.getElementById(scriptId);
      script.addEventListener("load", () => loadClustererScript());
    }
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.google) return;

    const defaultLat = groupedList[0]?.lat || userLocation?.lat || 37.5665;
    const defaultLng = groupedList[0]?.lng || userLocation?.lng || 126.978;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: Number(defaultLat), lng: Number(defaultLng) },
        zoom: 12,
      });
    }

    const map = mapInstanceRef.current;

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (groupedList.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      const infoWindow = new window.google.maps.InfoWindow();

      map.addListener("click", () => {
        infoWindow.close();
      });

      groupedList.forEach((group) => {
        const position = { lat: group.lat, lng: group.lng };

        const customSvgIcon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#4f46e5",
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 20,
        };

        const marker = new window.google.maps.Marker({
          position,
          title: `${group.name} (${group.totalCount}건)`,
          icon: customSvgIcon,
          label: {
            text: String(group.totalCount),
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "bold",
          },
        });

        marker.addListener("click", () => {
          // ★ 폐기물 종류 항목은 제거하고 날짜와 건수/조회 버튼만 깔끔하게 노출
          const listHtml = group.list
            .map((item, idx) => {
              const formattedDate = item.assignedDate;

              return `
                <div 
                  class="waste-item-card"
                  data-index="${idx}"
                  style="
                    padding: 10px 12px;
                    margin-bottom: 8px;
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.2s ease;
                  "
                  onmouseover="this.style.backgroundColor='#eff6ff'; this.style.borderColor='#93c5fd';"
                  onmouseout="this.style.backgroundColor='#f8fafc'; this.style.borderColor='#e2e8f0';"
                >
                  <span style="font-size: 13px; font-weight: 700; color: #334155;">
                    ${formattedDate}
                  </span>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 11px; font-weight: 700; color: #2563eb; background: #dbeafe; padding: 2px 8px; border-radius: 4px;">
                      ${item.countVal}건
                    </span>
                    <span style="font-size: 12px; color: #3b82f6; font-weight: 600;">조회 →</span>
                  </div>
                </div>
              `;
            })
            .join("");

          const contentString = `
            <div style="padding: 6px 2px; color: #0f172a; width: 260px; max-height: 320px; display: flex; flex-direction: column;">
              <div style="margin-bottom: 10px;">
                <h4 style="margin: 0 0 2px 0; font-size: 15px; font-weight: 700; color: #1e293b;">
                  ${group.name}
                </h4>
                <div style="font-size: 12px; color: #64748b;">
                  주소: ${group.address}
                </div>
                <div style="margin-top: 4px; font-size: 13px; font-weight: 700; color: #2563eb;">
                  총 탐지 건수: ${group.totalCount}건
                </div>
              </div>

              <div style="overflow-y: auto; max-height: 220px; padding-right: 4px;">
                ${listHtml}
              </div>
            </div>
          `;

          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);

          window.google.maps.event.addListenerOnce(
            infoWindow,
            "domready",
            () => {
              const cardElements =
                document.querySelectorAll(".waste-item-card");
              cardElements.forEach((card) => {
                card.addEventListener("click", () => {
                  const idx = Number(card.getAttribute("data-index"));
                  const targetItem = group.list[idx];
                  if (!targetItem) return;

                  const params = new URLSearchParams();

                  const formattedDate = targetItem.assignedDate;
                  if (formattedDate && formattedDate !== "-") {
                    params.set("date", formattedDate);
                  }

                  const selectedLocationId =
                    query.locationId ||
                    query.location_id ||
                    targetItem.regionId ||
                    targetItem.region_id;

                  if (selectedLocationId) {
                    params.set("locationId", selectedLocationId);
                  }

                  params.set("hasWaste", "true");

                  router.push(`/histories?${params.toString()}`);
                });
              });
            },
          );
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      });

      if (window.markerClusterer) {
        clustererRef.current = new window.markerClusterer.MarkerClusterer({
          map,
          markers: markersRef.current,
        });
      }

      if (groupedList.length > 1) {
        map.fitBounds(bounds);
      } else {
        map.setCenter({
          lat: Number(groupedList[0].lat),
          lng: Number(groupedList[0].lng),
        });
        map.setZoom(14);
      }
    } else {
      map.setCenter({ lat: Number(defaultLat), lng: Number(defaultLng) });
      map.setZoom(12);
    }
  }, [isMapLoaded, groupedList, userLocation, router, query]);

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
          {groupedList.length > 0 ? (
            <>
              총 <b style={{ color: "#0f172a" }}>{groupedList.length}</b>개 지점
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
