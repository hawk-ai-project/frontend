"use client";

import { useCallback, useEffect, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";

const LABEL={UNREVIEWED:"미검수",TRUE_POSITIVE:"정탐",FALSE_POSITIVE:"오탐",FALSE_NEGATIVE:"미탐"};
const number=value=>Number(value||0).toLocaleString("ko-KR");
const date=value=>value?new Intl.DateTimeFormat("ko-KR",{dateStyle:"short",timeStyle:"short"}).format(new Date(value)):"-";

export default function DetectionReviewPage(){
  const [data,setData]=useState(null),[stats,setStats]=useState(null),[page,setPage]=useState(1);
  const [filters,setFilters]=useState({keyword:"",result:""}),[query,setQuery]=useState({});
  const [selected,setSelected]=useState(null),[form,setForm]=useState(null);
  const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
  const load=useCallback(async()=>{setLoading(true);setError("");try{const [list,summary]=await Promise.all([adminService.getAiDetections({page,pageSize:20,...query}),adminService.getAiStatistics()]);setData(list);setStats(summary);}catch(e){setError(getApiErrorMessage(e,"탐지 결과를 불러오지 못했습니다."));}finally{setLoading(false);}},[page,query]);
  useEffect(()=>{const timer=setTimeout(()=>void load(),0);return()=>clearTimeout(timer);},[load]);
  const search=e=>{e.preventDefault();setPage(1);setQuery({keyword:filters.keyword.trim()||undefined,result:filters.result||undefined});};
  const open=item=>{if(selected?.id===item.id){setSelected(null);setForm(null);return;}setSelected(item);setForm({result:item.reviewResult,actualClass:item.actualClass||item.predictedClass,bbox:[item.bboxX,item.bboxY,item.bboxWidth,item.bboxHeight].map(Number),errorReason:item.errorReason||"",reviewStatus:item.reviewStatus,retrainingCandidate:Boolean(item.retrainingCandidate)});};
  const save=async()=>{setSaving(true);setError("");try{await adminService.reviewAiDetection(selected.id,form);setSelected(null);setForm(null);await load();}catch(e){setError(getApiErrorMessage(e,"검수 결과를 저장하지 못했습니다."));}finally{setSaving(false);}};
  return <div className="admin-page ai-review-page">
    <header className="admin-page-head"><div><span className="admin-kicker">AI MANAGEMENT</span><h1>탐지 결과 검수</h1><p>AI 탐지 결과를 판정하고 Annotation과 재학습 후보를 관리합니다.</p></div></header>
    <div className="admin-stat-grid">
      <article><span>전체 탐지</span><strong>{stats?number(stats.total):"-"}</strong><small>저장된 객체 기준</small></article>
      <article><span>검수 대기</span><strong>{stats?number(stats.unreviewed):"-"}</strong><small>관리자 판정 필요</small></article>
      <article><span>오탐·미탐</span><strong>{stats?number(Number(stats.falsePositive||0)+Number(stats.falseNegative||0)):"-"}</strong><small>오류 분석 대상</small></article>
      <article><span>재학습 후보</span><strong>{stats?number(stats.retrainingCandidates):"-"}</strong><small className="positive">학습 검토 대상</small></article>
    </div>
    <ErrorMessage message={error}/>
    <section className="admin-panel">
      <div className="admin-toolbar ai-review-toolbar"><div><h2>탐지 목록</h2><p>행을 선택하면 판정과 Bounding Box를 수정할 수 있습니다.</p></div><form className="admin-search-form ai-review-filters" onSubmit={search}><select value={filters.result} onChange={e=>setFilters(v=>({...v,result:e.target.value}))}><option value="">전체 판정</option>{Object.entries(LABEL).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select><input type="search" value={filters.keyword} onChange={e=>setFilters(v=>({...v,keyword:e.target.value}))} placeholder="점검명, 장소, 클래스"/><button type="submit">검색</button></form></div>
      {loading&&!data?<div className="admin-data-loading"><span className="admin-spinner"/>탐지 결과를 불러오고 있습니다.</div>:<div className="admin-table-wrap"><table className="admin-table ai-detection-table"><thead><tr><th>ID</th><th>탐지 일시</th><th>점검</th><th>예측 클래스</th><th>신뢰도</th><th>모델</th><th>판정</th><th>학습 후보</th><th/></tr></thead><tbody>
        {(data?.items||[]).map(item=><DetectionRow key={item.id} item={item} expanded={selected?.id===item.id} form={form} setForm={setForm} onOpen={()=>open(item)} onSave={save} saving={saving}/>)}
        {data&&!data.items.length&&<tr><td colSpan="9" className="admin-empty-cell">조건에 맞는 탐지 결과가 없습니다.</td></tr>}
      </tbody></table></div>}
      {data?.totalPages>1&&<div className="admin-pagination"><button disabled={page<=1} onClick={()=>setPage(v=>v-1)}>이전</button><span>{page} / {data.totalPages} · 총 {number(data.totalItems)}건</span><button disabled={page>=data.totalPages} onClick={()=>setPage(v=>v+1)}>다음</button></div>}
    </section>
  </div>;
}

function DetectionRow({item,expanded,form,setForm,onOpen,onSave,saving}){
  return <><tr className={expanded?"ai-detection-row selected":"ai-detection-row"} onClick={onOpen}><td>#{item.id}</td><td>{date(item.detectedAt)}</td><td><div className="activity-action"><strong>{item.title}</strong><small>{item.location||"-"}</small></div></td><td>{item.predictedClass}</td><td>{(Number(item.confidence)*100).toFixed(1)}%</td><td><div className="activity-action"><strong>{item.modelName}</strong><small>{item.modelVersion}</small></div></td><td><span className={`ai-result result-${item.reviewResult.toLowerCase()}`}>{LABEL[item.reviewResult]}</span></td><td>{item.retrainingCandidate?"YES":"-"}</td><td><button type="button" className="comment-review-btn">{expanded?"닫기":"검수"}</button></td></tr>
    {expanded&&form&&<tr className="comment-review-row ai-review-row"><td colSpan="9"><div className="ai-review-form"><section><h3>판정 정보</h3><div className="ai-field-grid"><label><span>판정</span><select value={form.result} onChange={e=>setForm(v=>({...v,result:e.target.value}))}>{Object.entries(LABEL).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label><label><span>실제 클래스</span><input value={form.actualClass} onChange={e=>setForm(v=>({...v,actualClass:e.target.value}))}/></label></div><label className="comment-reason"><span>오류 원인</span><textarea value={form.errorReason} onChange={e=>setForm(v=>({...v,errorReason:e.target.value}))} placeholder="파도, 반사광, 작은 객체 등"/></label></section><section><h3>Bounding Box</h3><div className="ai-bbox-grid">{["X","Y","Width","Height"].map((label,index)=><label key={label}><span>{label}</span><input type="number" min="0" max="1" step=".001" value={form.bbox[index]} onChange={e=>setForm(v=>({...v,bbox:v.bbox.map((n,i)=>i===index?Number(e.target.value):n)}))}/></label>)}</div><label className="ai-candidate-check"><input type="checkbox" checked={form.retrainingCandidate} onChange={e=>setForm(v=>({...v,retrainingCandidate:e.target.checked}))}/><span>재학습 후보 데이터로 등록</span></label><div className="comment-moderation-actions"><button type="button" className="restore" disabled={saving} onClick={onSave}>{saving?"저장 중":"검수 저장"}</button></div></section></div></td></tr>}
  </>;
}
