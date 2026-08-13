"use client";

import { useCallback,useEffect,useState } from "react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";
import ErrorMessage from "@/components/common/ErrorMessage";
import Link from "next/link";

function DataThumbnail({inspectionId}){
  const [url,setUrl]=useState("");
  useEffect(()=>{let active=true,objectUrl="";adminService.getInspectionImage(inspectionId).then(blob=>{if(active){objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);}}).catch(()=>{});return()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};},[inspectionId]);
  return <div className="data-thumb" style={url?{backgroundImage:`url("${url}")`}:undefined}>{!url&&<span>IMAGE</span>}</div>;
}

export default function AiDataBrowser(){
  const [data,setData]=useState(null),[tags,setTags]=useState([]),[selected,setSelected]=useState([]);
  const [filters,setFilters]=useState({keyword:"",result:"",tagIds:[]}),[page,setPage]=useState(1);
  const [error,setError]=useState(""),[notice,setNotice]=useState(""),[working,setWorking]=useState(false);
  const [bulkTag,setBulkTag]=useState("");
  const load=useCallback(async()=>{try{setError("");const [items,allTags]=await Promise.all([adminService.getAiData({page,pageSize:24,...filters}),adminService.getAiTags()]);setData(items);setTags(allTags);}catch(e){setError(getApiErrorMessage(e));}},[filters,page]);
  useEffect(()=>{const timer=setTimeout(()=>void load(),0);return()=>clearTimeout(timer);},[load]);
  const toggle=id=>setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
  const bulk=async(action,tagIds=[])=>{if(!selected.length)return;setWorking(true);setNotice("");try{const result=await adminService.bulkAiData({inspectionIds:selected,action,tagIds});setNotice(`${result.selectedCount}개 데이터 처리가 완료되었습니다.`);setSelected([]);await load();}catch(e){setError(getApiErrorMessage(e));}finally{setWorking(false);}};
  return <div className="admin-page ai-data-page">
    <header className="admin-page-head"><div><span className="admin-kicker">AI DATA</span><h1>Data Browser</h1><p>운영 이미지를 태그로 검색하고 검수·재학습 후보·Hard Example을 일괄 관리합니다.</p></div></header>
    <section className="admin-panel data-filter-panel"><div className="admin-toolbar data-browser-toolbar"><div><h2>운영 데이터</h2><p>이미지, 탐지 클래스와 환경 태그를 조합해 조회합니다.</p></div><div className="admin-search-form">
      <input placeholder="점검명 또는 장소 검색" value={filters.keyword} onChange={e=>setFilters(v=>({...v,keyword:e.target.value}))}/>
      <select value={filters.result} onChange={e=>{setPage(1);setFilters(v=>({...v,result:e.target.value}));}}><option value="">전체 판정</option><option value="TRUE_POSITIVE">정탐</option><option value="FALSE_POSITIVE">오탐</option><option value="FALSE_NEGATIVE">미탐</option><option value="UNREVIEWED">미검수</option></select>
      <select value={filters.tagIds[0]||""} onChange={e=>{setPage(1);setFilters(v=>({...v,tagIds:e.target.value?[Number(e.target.value)]:[]}));}}><option value="">전체 태그</option>{tags.map(tag=><option key={tag.id} value={tag.id}>[{tag.categoryName}] {tag.name} ({tag.usageCount})</option>)}</select>
    </div></div></section>
    {selected.length>0&&<section className="data-bulk-bar"><strong>{selected.length}개 선택</strong><select value={bulkTag} onChange={e=>setBulkTag(e.target.value)}><option value="">추가할 태그</option>{tags.map(tag=><option key={tag.id} value={tag.id}>{tag.name}</option>)}</select><button disabled={!bulkTag||working} onClick={()=>bulk("ADD_TAG",[Number(bulkTag)])}>태그 추가</button><button disabled={working} onClick={()=>bulk("RETRAIN")}>재학습 후보</button><button disabled={working} onClick={()=>bulk("HARD_EXAMPLE")}>Hard Example</button><button disabled={working} onClick={()=>bulk("APPROVE")}>검수 승인</button><button disabled={working} onClick={()=>bulk("REJECT")}>제외</button></section>}
    <ErrorMessage message={error}/>{notice&&<p className="admin-notice">{notice}</p>}
    <section className="data-card-grid">{(data?.items||[]).map(item=><article key={item.inspectionId} className={selected.includes(item.inspectionId)?"selected":""} onClick={()=>toggle(item.inspectionId)}>
      <DataThumbnail inspectionId={item.inspectionId}/><input className="data-select" type="checkbox" checked={selected.includes(item.inspectionId)} readOnly/>
      <div className="data-card-body"><small>#{item.inspectionId} · {new Date(item.capturedAt).toLocaleDateString("ko-KR")}</small><h3>{item.title}</h3><p>{item.location||"위치 정보 없음"} · 탐지 {item.detectionCount}개</p><div className="data-class-row"><span>{item.classes||"탐지 클래스 없음"}</span><b>{item.maxConfidence?Math.round(Number(item.maxConfidence)*100):0}%</b></div><div className="data-tag-row">{item.tags.map(tag=><i key={tag}>#{tag}</i>)}</div><footer>{item.approved&&<em>Approved</em>}{item.retrainingCandidate&&<em>Retraining</em>}<span>{item.modelVersion}</span></footer><Link className="data-annotate-link" href={`/admin/ai/data/${item.inspectionId}`} onClick={e=>e.stopPropagation()}>Annotation 편집</Link></div>
    </article>)}{data&&!data.items.length&&<p className="data-empty">조건에 맞는 데이터가 없습니다.</p>}</section>
    {data?.totalPages>1&&<nav className="admin-pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>이전</button><span>{page} / {data.totalPages} · 총 {data.totalItems}개</span><button disabled={page>=data.totalPages} onClick={()=>setPage(p=>p+1)}>다음</button></nav>}
  </div>;
}
