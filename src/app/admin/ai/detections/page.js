"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";

const LABEL = { UNREVIEWED:"미검수", TRUE_POSITIVE:"정탐", FALSE_POSITIVE:"오탐", FALSE_NEGATIVE:"미탐" };

export default function DetectionReviewPage() {
  const [data,setData]=useState(null), [stats,setStats]=useState(null);
  const [filters,setFilters]=useState({keyword:"",result:""}), [page,setPage]=useState(1);
  const [selected,setSelected]=useState(null), [form,setForm]=useState(null);
  const [error,setError]=useState(""), [saving,setSaving]=useState(false);
  const load=useCallback(async()=>{
    try {
      setError("");
      const [list,summary]=await Promise.all([adminService.getAiDetections({page,pageSize:20,...filters}),adminService.getAiStatistics()]);
      setData(list); setStats(summary);
    } catch(e) { setError(getApiErrorMessage(e)); }
  },[filters,page]);
  useEffect(()=>{
    const timer=window.setTimeout(()=>{ void load(); },0);
    return ()=>window.clearTimeout(timer);
  },[load]);
  const open=(item)=>{setSelected(item);setForm({
    result:item.reviewResult, actualClass:item.actualClass||item.predictedClass,
    bbox:[item.bboxX,item.bboxY,item.bboxWidth,item.bboxHeight].map(Number),
    errorReason:item.errorReason||"", reviewStatus:item.reviewStatus,
    retrainingCandidate:Boolean(item.retrainingCandidate),
  });};
  const save=async()=>{setSaving(true);try{await adminService.reviewAiDetection(selected.id,form);setSelected(null);await load();}catch(e){setError(getApiErrorMessage(e));}finally{setSaving(false);}};
  return <div className="admin-page ai-review-page">
    <header className="admin-page-header"><div><span className="admin-eyebrow">AI MANAGEMENT</span><h1>탐지 결과 검수</h1><p>탐지 결과를 정탐·오탐·미탐으로 판정하고 재학습 후보를 관리합니다.</p></div></header>
    {stats&&<section className="ai-stat-grid">
      <article><span>전체 탐지</span><strong>{Number(stats.total||0).toLocaleString()}</strong></article>
      <article><span>검수 대기</span><strong>{Number(stats.unreviewed||0).toLocaleString()}</strong></article>
      <article><span>오탐 / 미탐</span><strong>{Number(stats.falsePositive||0)+Number(stats.falseNegative||0)}</strong></article>
      <article><span>재학습 후보</span><strong>{Number(stats.retrainingCandidates||0).toLocaleString()}</strong></article>
    </section>}
    <div className="ai-filter-bar"><input value={filters.keyword} onChange={e=>setFilters(v=>({...v,keyword:e.target.value}))} placeholder="점검명, 장소, 클래스 검색"/><select value={filters.result} onChange={e=>{setPage(1);setFilters(v=>({...v,result:e.target.value}));}}><option value="">전체 판정</option>{Object.entries(LABEL).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
    {error&&<p className="admin-error">{error}</p>}
    <section className="admin-panel"><div className="admin-table-wrap"><table className="admin-table ai-detection-table"><thead><tr><th>ID</th><th>탐지 일시</th><th>점검 / 장소</th><th>예측</th><th>Confidence</th><th>모델</th><th>판정</th><th>학습 후보</th><th/></tr></thead><tbody>
      {(data?.items||[]).map(item=><tr key={item.id}><td>#{item.id}</td><td>{new Date(item.detectedAt).toLocaleString("ko-KR")}</td><td><strong>{item.title}</strong><small>{item.location||"-"}</small></td><td>{item.predictedClass}</td><td>{(Number(item.confidence)*100).toFixed(1)}%</td><td>{item.modelName}<small>{item.modelVersion}</small></td><td><span className={`ai-result result-${item.reviewResult.toLowerCase()}`}>{LABEL[item.reviewResult]}</span></td><td>{item.retrainingCandidate?"YES":"-"}</td><td><button onClick={()=>open(item)}>검수</button></td></tr>)}
      {data&&!data.items.length&&<tr><td colSpan="9" className="admin-empty-cell">탐지 결과가 없습니다.</td></tr>}
    </tbody></table></div></section>
    {data?.totalPages>1&&<nav className="admin-pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>이전</button><span>{page} / {data.totalPages}</span><button disabled={page>=data.totalPages} onClick={()=>setPage(p=>p+1)}>다음</button></nav>}
    {selected&&form&&<div className="ai-review-backdrop" onMouseDown={()=>setSelected(null)}><section className="ai-review-modal" onMouseDown={e=>e.stopPropagation()}><header><div><small>DETECTION #{selected.id}</small><h2>탐지 결과 검수</h2></div><button onClick={()=>setSelected(null)}>×</button></header>
      <div className="ai-review-summary"><span>AI 예측 <strong>{selected.predictedClass}</strong></span><span>Confidence <strong>{(Number(selected.confidence)*100).toFixed(1)}%</strong></span></div>
      <label>판정<select value={form.result} onChange={e=>setForm(v=>({...v,result:e.target.value}))}>{Object.entries(LABEL).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <label>실제 클래스<input value={form.actualClass} onChange={e=>setForm(v=>({...v,actualClass:e.target.value}))}/></label>
      <div className="ai-bbox-grid">{["X","Y","Width","Height"].map((label,index)=><label key={label}>{label}<input type="number" min="0" max="1" step="0.001" value={form.bbox[index]} onChange={e=>setForm(v=>({...v,bbox:v.bbox.map((n,i)=>i===index?Number(e.target.value):n)}))}/></label>)}</div>
      <label>오류 원인<textarea value={form.errorReason} onChange={e=>setForm(v=>({...v,errorReason:e.target.value}))} placeholder="파도, 반사광, 작은 객체 등"/></label>
      <label className="ai-check"><input type="checkbox" checked={form.retrainingCandidate} onChange={e=>setForm(v=>({...v,retrainingCandidate:e.target.checked}))}/>재학습 후보 데이터로 등록</label>
      <footer><button onClick={()=>setSelected(null)}>취소</button><button className="admin-primary-btn" disabled={saving} onClick={save}>{saving?"저장 중...":"검수 저장"}</button></footer>
    </section></div>}
  </div>;
}
