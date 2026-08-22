"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import { historyService } from "@/services/historyService";
import { getApiErrorMessage } from "@/services/apiClient";
import "./reinspections.css";

const COLORS = ["#36a2eb", "#ff6384", "#4bc0c0", "#ff9f40", "#9966ff"];
const date = (value) => new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

function ReviewCard({ item, checked, onCheck }) {
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    let url = "", active = true;
    historyService.getHistoryImage(item.inspectionId, "ORIGINAL").then((blob) => {
      if (active) { url = URL.createObjectURL(blob); setImageUrl(url); }
    }).catch(() => {});
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [item.inspectionId]);
  return <article className={`reinspection-card${checked ? " selected" : ""}`}>
    <div className="reinspection-image" style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}>
      {!imageUrl && <span>IMAGE</span>}
      {(item.detections || []).map((box, index) => <i key={box.id} className="reinspection-box" style={{ left: `${Number(box.bboxX) * 100}%`, top: `${Number(box.bboxY) * 100}%`, width: `${Number(box.bboxWidth) * 100}%`, height: `${Number(box.bboxHeight) * 100}%`, borderColor: COLORS[index % COLORS.length] }}><b style={{ background: COLORS[index % COLORS.length] }}>{box.className}</b></i>)}
      <label className="reinspection-check"><input type="checkbox" checked={checked} onChange={() => onCheck(item.inspectionId)} /><span>검수 완료</span></label>
    </div>
    <div className="reinspection-card-body"><small>#{item.inspectionId} · {date(item.capturedAt)}</small><h2>{item.title}</h2><p>{item.location || "위치 정보 없음"}</p><div className="reinspection-labels">{(item.detections || []).map((box) => <span key={box.id}>{box.className} <b>{Math.round(Number(box.confidence) * 100)}%</b></span>)}{!item.detections?.length && <span>탐지 객체 없음</span>}</div><footer><span>점검 대기</span><Link href={`/reinspections/${item.inspectionId}`}>직접 라벨링</Link></footer></div>
  </article>;
}

export default function ReinspectionsPage() {
  const [items, setItems] = useState([]), [selected, setSelected] = useState([]), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState("");
  const load = async () => { setLoading(true); try { setItems(await historyService.getReinspectionTargets()); setError(""); } catch (e) { setError(getApiErrorMessage(e, "재점검 대상을 불러오지 못했습니다.")); } finally { setLoading(false); } };
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, []);
  const toggle = (id) => setSelected((value) => value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  const save = async () => { if (!selected.length) return; setSaving(true); try { await historyService.approveReinspectionTargets(selected); setSelected([]); await load(); } catch (e) { setError(getApiErrorMessage(e, "상태 변경에 실패했습니다.")); } finally { setSaving(false); } };
  return <main className="page-shell reinspection-page"><header className="reinspection-head"><div><span>FIELD REVIEW</span><h1>재점검 대상이력</h1><p>AI 라벨을 확인하고 검수 완료된 이미지를 진행 대기 상태로 전환합니다.</p></div><button className="btn btn-primary" disabled={!selected.length || saving} onClick={save}>{saving ? "저장 중..." : `선택 저장${selected.length ? ` (${selected.length})` : ""}`}</button></header><ErrorMessage message={error} />{loading ? <div className="reinspection-empty">재점검 대상을 불러오는 중입니다.</div> : <section className="reinspection-grid">{items.map((item) => <ReviewCard key={item.inspectionId} item={item} checked={selected.includes(item.inspectionId)} onCheck={toggle} />)}{!items.length && <div className="reinspection-empty">점검 대기 중인 이미지가 없습니다.</div>}</section>}</main>;
}