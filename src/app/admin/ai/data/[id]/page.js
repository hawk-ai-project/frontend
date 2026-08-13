"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback,useEffect,useRef,useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";

const COLORS=["#36a2eb","#ff6384","#4bc0c0","#ff9f40","#9966ff","#57a773"];
const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));

export default function AnnotationEditor(){
  const {id}=useParams(),inspectionId=Number(id);
  const canvasRef=useRef(null),gestureRef=useRef(null);
  const nextTempId=useRef(-1);
  const [detail,setDetail]=useState(null),[classes,setClasses]=useState([]),[imageUrl,setImageUrl]=useState("");
  const [boxes,setBoxes]=useState([]),[selected,setSelected]=useState(null),[mode,setMode]=useState("select");
  const [deleted,setDeleted]=useState([]),[saving,setSaving]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
  const load=useCallback(async()=>{try{setError("");const [item,classList,blob]=await Promise.all([adminService.getAiDataDetail(inspectionId),adminService.getAiClasses(),adminService.getInspectionImage(inspectionId)]);setDetail(item);setClasses(classList);setBoxes(item.detections.map((d,index)=>({id:d.id,className:d.actualClass||d.predictedClass,bbox:[d.bboxX,d.bboxY,d.bboxWidth,d.bboxHeight].map(Number),result:d.reviewResult,reviewStatus:d.reviewStatus,retrainingCandidate:Boolean(d.retrainingCandidate),color:COLORS[index%COLORS.length],isNew:false})));setImageUrl(URL.createObjectURL(blob));}catch(e){setError(getApiErrorMessage(e,"Annotation 데이터를 불러오지 못했습니다."));}},[inspectionId]);
  useEffect(()=>{const timer=setTimeout(()=>void load(),0);return()=>{clearTimeout(timer);};},[load]);
  useEffect(()=>()=>{if(imageUrl)URL.revokeObjectURL(imageUrl);},[imageUrl]);
  const point=e=>{const r=canvasRef.current.getBoundingClientRect();return [clamp((e.clientX-r.left)/r.width),clamp((e.clientY-r.top)/r.height)];};
  const patchBox=(boxId,patch)=>setBoxes(items=>items.map(box=>box.id===boxId?{...box,...patch}:box));
  const pointerDown=e=>{if(e.button!==0)return;const [x,y]=point(e);if(mode==="draw"){const tempId=nextTempId.current;nextTempId.current-=1;gestureRef.current={kind:"draw",start:[x,y],tempId};setBoxes(items=>[...items,{id:tempId,className:classes[0]?.name||"Unknown",bbox:[x,y,.001,.001],result:"FALSE_NEGATIVE",reviewStatus:"LABELED",retrainingCandidate:true,color:COLORS[items.length%COLORS.length],isNew:true}]);setSelected(tempId);e.currentTarget.setPointerCapture(e.pointerId);}};
  const startMove=(e,box,kind)=>{if(mode!=="select")return;e.stopPropagation();const [x,y]=point(e);gestureRef.current={kind,id:box.id,start:[x,y],original:[...box.bbox]};setSelected(box.id);canvasRef.current.setPointerCapture(e.pointerId);};
  const pointerMove=e=>{const g=gestureRef.current;if(!g)return;const [x,y]=point(e);if(g.kind==="draw"){const bx=Math.min(g.start[0],x),by=Math.min(g.start[1],y);patchBox(g.tempId,{bbox:[bx,by,Math.max(.001,Math.abs(x-g.start[0])),Math.max(.001,Math.abs(y-g.start[1]))]});return;}const dx=x-g.start[0],dy=y-g.start[1],b=g.original;if(g.kind==="move")patchBox(g.id,{bbox:[clamp(b[0]+dx,0,1-b[2]),clamp(b[1]+dy,0,1-b[3]),b[2],b[3]]});else patchBox(g.id,{bbox:[b[0],b[1],clamp(b[2]+dx,.005,1-b[0]),clamp(b[3]+dy,.005,1-b[1])]});};
  const pointerUp=()=>{gestureRef.current=null;if(mode==="draw")setMode("select");};
  const remove=()=>{const box=boxes.find(b=>b.id===selected);if(!box)return;if(!box.isNew)setDeleted(v=>[...v,box.id]);setBoxes(v=>v.filter(b=>b.id!==selected));setSelected(null);};
  const save=async()=>{setSaving(true);setError("");setNotice("");try{for(const detectionId of deleted)await adminService.deleteAiDetection(detectionId);for(const box of boxes){if(box.isNew)await adminService.createMissedDetection({inspectionId,actualClass:box.className,bbox:box.bbox,errorReason:"관리자 수동 Annotation",retrainingCandidate:box.retrainingCandidate});else await adminService.reviewAiDetection(box.id,{result:box.result,actualClass:box.className,bbox:box.bbox,errorReason:null,reviewStatus:box.reviewStatus,retrainingCandidate:box.retrainingCandidate});}setDeleted([]);setNotice("Annotation 변경사항을 저장했습니다.");await load();}catch(e){setError(getApiErrorMessage(e,"Annotation 저장에 실패했습니다."));}finally{setSaving(false);}};
  const current=boxes.find(box=>box.id===selected);
  return <div className="admin-page annotation-page">
    <header className="admin-page-head"><div><span className="admin-kicker">ANNOTATION</span><h1>{detail?.title||"Annotation Editor"}</h1><p>{detail?detail.location:"이미지와 Annotation을 불러오고 있습니다."}</p></div><Link className="annotation-back" href="/admin/ai/data">Data Browser로 돌아가기</Link></header>
    <ErrorMessage message={error}/>{notice&&<p className="admin-notice">{notice}</p>}
    <section className="annotation-toolbar"><div><button className={mode==="select"?"active":""} onClick={()=>setMode("select")}>선택·이동</button><button className={mode==="draw"?"active":""} onClick={()=>setMode("draw")}>Bounding Box 추가</button><button disabled={!selected} onClick={remove}>선택 삭제</button></div><span>객체 {boxes.length}개 · 좌표는 이미지 비율 기준</span><button className="admin-primary-btn" disabled={saving||!detail} onClick={save}>{saving?"저장 중...":"변경사항 저장"}</button></section>
    <div className="annotation-workspace">
      <section className={`annotation-canvas-wrap mode-${mode}`}><div ref={canvasRef} className="annotation-canvas" style={{backgroundImage:imageUrl?`url("${imageUrl}")`:undefined}} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}>
        {boxes.map(box=><div key={box.id} className={selected===box.id?"annotation-box selected":"annotation-box"} style={{left:`${box.bbox[0]*100}%`,top:`${box.bbox[1]*100}%`,width:`${box.bbox[2]*100}%`,height:`${box.bbox[3]*100}%`,borderColor:box.color}} onPointerDown={e=>startMove(e,box,"move")}><span style={{background:box.color}}>{box.className}</span>{selected===box.id&&<i onPointerDown={e=>startMove(e,box,"resize")}/>}</div>)}
      </div></section>
      <aside className="annotation-sidebar"><div className="admin-toolbar"><div><h2>객체 목록</h2><p>박스를 선택해 속성을 편집합니다.</p></div></div><div className="annotation-object-list">{boxes.map((box,index)=><button key={box.id} className={selected===box.id?"active":""} onClick={()=>setSelected(box.id)}><i style={{background:box.color}}/><span><strong>{box.className}</strong><small>{box.isNew?"수동 추가":`Detection #${box.id}`}</small></span><b>{index+1}</b></button>)}</div>
        {current?<div className="annotation-properties"><h3>Annotation 속성</h3><label><span>Class</span><select value={current.className} onChange={e=>patchBox(current.id,{className:e.target.value})}>{classes.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></label><label><span>검수 상태</span><select value={current.reviewStatus} onChange={e=>patchBox(current.id,{reviewStatus:e.target.value})}><option value="LABELED">Labeled</option><option value="REVIEW_REQUIRED">Review Required</option><option value="REVIEWED">Reviewed</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></label><div className="annotation-coordinates">{["X","Y","W","H"].map((key,index)=><label key={key}><span>{key}</span><input type="number" min="0" max="1" step=".001" value={current.bbox[index].toFixed(3)} onChange={e=>{const next=[...current.bbox];next[index]=Number(e.target.value);patchBox(current.id,{bbox:next});}}/></label>)}</div><label className="ai-candidate-check"><input type="checkbox" checked={current.retrainingCandidate} onChange={e=>patchBox(current.id,{retrainingCandidate:e.target.checked})}/><span>재학습 후보</span></label></div>:<div className="annotation-empty">이미지의 박스를 선택하거나 새 박스를 그려주세요.</div>}
      </aside>
    </div>
  </div>;
}
