"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";

export default function InspectionInfo() {
  const [form, setForm] = useState({ location: "", inspector: "", memo: "" });
  const [coords, setCoords] = useState({ latitude: "", longitude: "" });
  const [gpsMessage, setGpsMessage] = useState("현재 위치를 가져와 주세요.");
  const [locating, setLocating] = useState(false);

  useEffect(() => { apiClient.get("/auth/me").then(({ data }) => setForm((v) => ({ ...v, inspector: data.name }))).catch(() => {}); }, []);
  const change = ({ target }) => setForm((v) => ({ ...v, [target.name]: target.value }));
  const locate = () => {
    if (!navigator.geolocation) return setGpsMessage("GPS를 지원하지 않는 기기입니다.");
    setLocating(true); setGpsMessage("현재 위치를 확인하는 중입니다...");
    navigator.geolocation.getCurrentPosition(({ coords: value }) => {
      setCoords({ latitude: value.latitude.toFixed(7), longitude: value.longitude.toFixed(7) });
      setGpsMessage(`위치 확인 완료 · 오차 약 ${Math.round(value.accuracy)}m`); setLocating(false);
    }, (error) => {
      setGpsMessage(error.code === 1 ? "브라우저 설정에서 위치 권한을 허용해 주세요." : "현재 위치를 가져오지 못했습니다."); setLocating(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  return <div className="card card-pad" style={{ height: "100%" }}><h3 className="section-title">점검 정보</h3><div className="form-stack">
    <label htmlFor="location">점검 장소<input id="location" name="location" className="input" value={form.location} onChange={change} placeholder="점검 장소를 입력하세요" /></label>
    <label htmlFor="inspector">점검자<input id="inspector" className="input" value={form.inspector} readOnly /></label>
    <div className="inspection-location-field"><b>GPS 좌표</b><input id="latitude" type="hidden" value={coords.latitude} readOnly /><input id="longitude" type="hidden" value={coords.longitude} readOnly /><input className="input" value={coords.latitude ? `${coords.latitude}, ${coords.longitude}` : "좌표 미등록"} readOnly /><button type="button" className="btn btn-secondary" onClick={locate} disabled={locating}>{locating ? "확인 중..." : "현재 위치 가져오기"}</button><small>{gpsMessage}</small></div>
    <label htmlFor="memo">점검 메모<textarea id="memo" name="memo" className="input" value={form.memo} onChange={change} style={{ minHeight: 120 }} /></label>
  </div></div>;
}
