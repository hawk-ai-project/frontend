"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsMap({ items = [], query = {} }) {
  const router = useRouter();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clustererRef = useRef(null);
  const markersRef = useRef([]);

  // 1. 내역 페이지 이동 글로벌 함수
  useEffect(() => {
    window.__navigateToHistory = (dateStr, regionId, regionName) => {
      const params = new URLSearchParams();

      if (dateStr && dateStr !== "-") {
        const cleanDate = String(dateStr).replace(/-/g, ".");
        params.set("startDate", cleanDate);
        params.set("endDate", cleanDate);
      }

      params.set("hasWaste", "true");

      if (
        regionId !== undefined &&
        regionId !== null &&
        regionId !== "" &&
        regionId !== "0" &&
        regionId !== "undefined"
      ) {
        params.set("locationId", String(regionId));
      }

      if (regionName && regionName !== "-" && regionName !== "undefined") {
        params.set("location", String(regionName));
      }

      const targetUrl = `/histories?${params.toString()}`;
      router.push(targetUrl);
      router.refresh();
    };

    return () => {
      delete window.__navigateToHistory;
    };
  }, [router]);

  // 날짜 포맷팅 (YYYY.MM.DD)
  const formatItemDate = (rawDate) => {
    if (!rawDate) return "-";
    const strMatch = String(rawDate).match(/(\d{4})[-./](\d{2})[-./](\d{2})/);
    if (strMatch) return `${strMatch[1]}.${strMatch[2]}.${strMatch[3]}`;

    const d = new Date(rawDate);
    if (isNaN(d.getTime()))
      return String(rawDate).split("T")[0].replace(/-/g, ".");

    const kstDate = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const yyyy = kstDate.getUTCFullYear();
    const mm = String(kstDate.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(kstDate.getUTCDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
  };

  // 2. 유효 좌표 데이터 필터링 및 동일 좌표 그룹화
  const validItems = items.filter(
    (item) =>
      item && item.latitude && item.longitude && Number(item.latitude) !== 0,
  );

  const groupedItems = validItems.reduce((acc, item) => {
    const lat = Number(item.latitude).toFixed(6);
    const lng = Number(item.longitude).toFixed(6);
    const key = `${lat}_${lng}`;

    // DB 필드명 전면 대응 (detection_count가 없을 경우 count 등 체크)
    const rawVal =
      item.detection_count ?? item.detectionCount ?? item.count ?? 0;
    const itemDetections = Number(rawVal) || 0;
    const itemInspections = Number(item.count) || 1;
    const formattedDate = formatItemDate(item.date);

    const rId = item.region_id ?? item.regionId ?? item.id ?? 0;
    const rName = item.region ?? item.region_name ?? item.regionName ?? "-";

    if (!acc[key]) {
      acc[key] = {
        regionId: rId,
        regionName: rName,
        lat: Number(lat),
        lng: Number(lng),
        name: item.name || item.address || "점검 위치",
        address: item.address || "-",
        totalDetections: 0,
        totalInspections: 0,
        dateGroups: {},
      };
    }

    acc[key].totalDetections += itemDetections;
    acc[key].totalInspections += itemInspections;

    if (!acc[key].dateGroups[formattedDate]) {
      acc[key].dateGroups[formattedDate] = {
        date: formattedDate,
        detectionCount: 0,
        inspectionCount: 0,
        regionId: rId,
        regionName: rName,
      };
    }
    acc[key].dateGroups[formattedDate].detectionCount += itemDetections;
    acc[key].dateGroups[formattedDate].inspectionCount += itemInspections;

    return acc;
  }, {});

  const groupedList = Object.values(groupedItems);

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 3. Google Maps 스크립트 로드
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

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
    }
  }, []);

  // 4. 지도 렌더링
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.google) return;

    const defaultLat = groupedList[0]?.lat || 37.5665;
    const defaultLng = groupedList[0]?.lng || 126.978;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: Number(defaultLat), lng: Number(defaultLng) },
        zoom: 11,
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

      map.addListener("click", () => infoWindow.close());

      groupedList.forEach((group) => {
        const position = { lat: group.lat, lng: group.lng };

        // 보라색 아이콘 고정 (#4f46e5)
        const customSvgIcon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#4f46e5",
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 18,
        };

        const marker = new window.google.maps.Marker({
          position,
          title: `${group.name} (탐지: ${group.totalDetections}건)`,
          icon: customSvgIcon,
          label: {
            text: String(group.totalDetections),
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "bold",
          },
        });

        marker.customDetectionCount = Number(group.totalDetections) || 0;

        marker.addListener("click", () => {
          const dateGroupList = Object.values(group.dateGroups);

          const listHtml = dateGroupList
            .map((dateGroup) => {
              const formattedDate = dateGroup.date;
              const dCount = Number(dateGroup.detectionCount) || 0;
              // 1건 이상일 때만 이동 허용
              const hasDetections = dCount >= 1;

              const targetRegionId = dateGroup.regionId || group.regionId || 0;
              const targetRegionName =
                dateGroup.regionName || group.regionName || "-";

              const onClickAttr = hasDetections
                ? `onclick="window.__navigateToHistory('${formattedDate}', '${targetRegionId}', '${targetRegionName}')"`
                : "";

              return `
                <div 
                  class="waste-item-card"
                  ${onClickAttr}
                  style="
                    padding: 8px 10px;
                    margin-bottom: 6px;
                    background-color: ${hasDetections ? "#f8fafc" : "#f1f5f9"};
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    cursor: ${hasDetections ? "pointer" : "not-allowed"};
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    opacity: ${hasDetections ? "1" : "0.7"};
                  "
                >
                  <span style="font-size: 13px; font-weight: 700; color: #334155;">
                    ${formattedDate}
                  </span>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 11px; font-weight: 700; color: ${
                      hasDetections ? "#2563eb" : "#64748b"
                    }; background: ${
                      hasDetections ? "#dbeafe" : "#e2e8f0"
                    }; padding: 2px 6px; border-radius: 4px;">
                      ${dCount}건
                    </span>
                    ${
                      hasDetections
                        ? `<span style="font-size: 12px; color: #3b82f6; font-weight: 600;">조회 →</span>`
                        : `<span style="font-size: 12px; color: #94a3b8;">(탐지 없음)</span>`
                    }
                  </div>
                </div>
              `;
            })
            .join("");

          const contentString = `
            <div style="padding: 4px; color: #0f172a; width: 250px; max-height: 300px; display: flex; flex-direction: column;">
              <div style="margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <span style="font-size: 11px; font-weight: 700; background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px;">
                    ${group.regionName || "-"}
                  </span>
                  <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${group.name}
                  </h4>
                </div>
                <div style="font-size: 11px; color: #64748b;">
                  주소: ${group.address}
                </div>
                <div style="margin-top: 4px; font-size: 12px; font-weight: 700; color: ${
                  group.totalDetections > 0 ? "#2563eb" : "#64748b"
                };">
                  총 탐지 수: ${group.totalDetections}건
                </div>
              </div>
              <div style="overflow-y: auto; max-height: 200px;">
                ${listHtml}
              </div>
            </div>
          `;

          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      });

      if (window.markerClusterer) {
        const renderer = {
          render: ({ count, position, markers }) => {
            const clusterTotalDetections = markers.reduce(
              (sum, m) => sum + (Number(m.customDetectionCount) || 0),
              0,
            );

            return new window.google.maps.Marker({
              position,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: "#4338ca",
                fillOpacity: 0.95,
                strokeColor: "#ffffff",
                strokeWeight: 3,
                scale: 22,
              },
              label: {
                text: String(clusterTotalDetections),
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "bold",
              },
              title: `클러스터 총 탐지 건수: ${clusterTotalDetections}건`,
            });
          },
        };

        clustererRef.current = new window.markerClusterer.MarkerClusterer({
          map,
          markers: markersRef.current,
          renderer,
        });
      }

      if (groupedList.length > 1) {
        map.fitBounds(bounds);
      } else {
        map.setCenter({
          lat: Number(groupedList[0].lat),
          lng: Number(groupedList[0].lng),
        });
        map.setZoom(13);
      }
    }
  }, [isMapLoaded, groupedList]);

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
              조회 데이터 없음
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
