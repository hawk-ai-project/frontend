'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { inspectionService } from '@/services/inspectionService';
import { getApiErrorMessage } from '@/services/apiClient';
import { STATUS_OPTIONS, statusClass } from './historyData';

const formatDateTime = (value) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value));
const roleLabel = { ADMIN: '관리자', MANAGER: '현장 관리자', INSPECTOR: '현장 점검자' };

export default function HistoryDetailClient({ history, detail, inspectionId = null }) {
  const [status, setStatus] = useState(history.status);
  const [opinion, setOpinion] = useState(detail.opinion);
  const [saved, setSaved] = useState(true);
  const [afterImage, setAfterImage] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [assigneeName, setAssigneeName] = useState(detail.assigneeName || '담당자 미지정');
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const source = detail.originalImageUrl;
  const analyzedSource = detail.annotatedImageUrl;
  const currentStep = status === '완료' ? '완료' : status === '진행' ? '진행' : '대기';

  const openAssignment = async () => {
    setAssignmentError(inspectionId ? '' : '서버에 저장된 점검에서만 담당자를 지정할 수 있습니다.');
    setAssignmentOpen(true);
    if (!inspectionId || assignees.length) return;
    setAssignmentLoading(true);
    try {
      const items = await inspectionService.assignees();
      const list = Array.isArray(items) ? items : [];
      setAssignees(list);
      if (list.length) setSelectedAssigneeId(String(list[0].id));
    } catch (error) {
      setAssignmentError(getApiErrorMessage(error, '담당자 목록을 불러오지 못했습니다.'));
    } finally {
      setAssignmentLoading(false);
    }
  };

  const submitAssignment = async () => {
    if (!inspectionId || !selectedAssigneeId) return;
    setAssignmentLoading(true);
    setAssignmentError('');
    try {
      const result = await inspectionService.assign(inspectionId, Number(selectedAssigneeId));
      setAssigneeName(result.assignee.name);
      setAssignmentOpen(false);
    } catch (error) {
      setAssignmentError(getApiErrorMessage(error, '담당자를 지정하지 못했습니다.'));
    } finally {
      setAssignmentLoading(false);
    }
  };

  return <div className="page-shell history-detail-page compact-detail-page">
    <div className="detail-header"><div><div className="eyebrow">Inspection Detail</div><h1>점검 상세 <span>#{history.id}</span></h1><p>점검 결과를 확인하고 후속 조치와 처리 상태를 관리하세요.</p></div><div className="detail-header-actions"><Link className="btn btn-primary" href="/histories">목록</Link><label>처리 상태<select value={status} onChange={(event) => setStatus(event.target.value)}>{STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label><button className="btn btn-primary" type="button" onClick={() => setStatus('완료')}>수거 작업 완료 처리</button></div></div>
    <div className="compact-top-grid"><article className="card compact-image-card"><div className="detail-image-grid"><DetailImage title="원본 이미지" src={source} downloadName={`inspection-${inspectionId}-original`} onZoom={setZoomImage} /><DetailImage title="분석 이미지" src={analyzedSource} downloadName={`inspection-${inspectionId}-annotated`} analyzed onZoom={setZoomImage} /></div></article><article className="card compact-summary-card"><h2>점검 요약</h2><div className="compact-meta-grid"><Meta label="처리 상태" value={<span className={`badge ${statusClass(status)}`}>{status}</span>} /><Meta label="점검 일시" value={formatDateTime(history.inspectedAt)} /><Meta label="점검 장소" value={detail.fullLocation} /><Meta label="점검자" value={detail.inspector} /><Meta label="GPS 좌표" value={detail.coordinates || '좌표 미등록'} /><Meta label="현장 위치" value={<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${detail.fullLocation}, 대한민국`)}`} target="_blank" rel="noreferrer">지도 보기</a>} /></div><h3>탐지 결과</h3><div className="detection-tags">{detail.detections.map(([name, count]) => <span key={name}>{name} <b>{count}개</b></span>)}</div></article></div>
    <div className="compact-action-grid"><article className="card card-pad after-card"><h2>수거 완료 증빙 사진</h2><label className="after-photo-upload">{afterImage ? <img src={afterImage} alt="수거 완료 증빙 사진" /> : <><b>+ 사진 등록</b><span>수거 완료 후 현장 사진을 첨부하세요.</span></>}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) setAfterImage(URL.createObjectURL(file)); }} /></label></article><article className="card card-pad opinion-card"><div className="detail-card-title"><h2>점검 의견 및 후속 조치</h2><button className="btn btn-primary" type="button" onClick={() => setSaved(true)}>저장</button></div><textarea value={opinion} onChange={(event) => { setOpinion(event.target.value); setSaved(false); }} /><small>{saved ? '저장된 내용입니다.' : '수정된 내용이 있습니다.'}</small></article></div>
    <article className="card card-pad detail-process"><div className="detail-card-title"><h2>처리 이력</h2><button className="btn btn-soft" type="button" onClick={openAssignment}>담당자 지정</button></div><div className="detail-process-steps"><Step label="1단계 · 점검 등록" value="AI 점검 결과 저장" /><Step label="2단계 · 담당자 배정" value={assigneeName} /><Step label="3단계 · 수거/조치" value={currentStep} /><Step label="4단계 · 완료" value={status === '완료' ? '완료' : '대기'} /></div></article>
    {assignmentOpen && <div className="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="assignment-title" onClick={() => setAssignmentOpen(false)}><div onClick={(event) => event.stopPropagation()}><div className="assignment-modal-header"><div><h2 id="assignment-title">담당자 지정</h2><p>후속 수거 작업을 담당할 사용자를 선택하세요.</p></div><button type="button" aria-label="닫기" onClick={() => setAssignmentOpen(false)}>×</button></div>{assignmentLoading && !assignees.length ? <p className="assignment-state">담당자 목록을 불러오는 중입니다.</p> : assignees.length ? <div className="assignee-list">{assignees.map((assignee) => <label key={assignee.id} className={selectedAssigneeId === String(assignee.id) ? 'selected' : ''}><input type="radio" name="assignee" value={assignee.id} checked={selectedAssigneeId === String(assignee.id)} onChange={(event) => setSelectedAssigneeId(event.target.value)} /><span><strong>{assignee.name}</strong><small>{roleLabel[assignee.role] || assignee.role}</small></span></label>)}</div> : !assignmentError && <p className="assignment-state">지정할 수 있는 활성 담당자가 없습니다.</p>}{assignmentError && <p className="assignment-error">{assignmentError}</p>}<div className="assignment-modal-actions"><button className="btn btn-soft" type="button" onClick={() => setAssignmentOpen(false)}>취소</button><button className="btn btn-primary" type="button" disabled={assignmentLoading || !selectedAssigneeId || !inspectionId} onClick={submitAssignment}>{assignmentLoading && assignees.length ? '저장 중...' : '담당자 지정'}</button></div></div></div>}
    {zoomImage && <div className="detail-image-modal" onClick={() => setZoomImage(null)}><div onClick={(event) => event.stopPropagation()}><button onClick={() => setZoomImage(null)}>×</button><img src={zoomImage} alt="점검 이미지 확대" /></div></div>}
  </div>;
}

function DetailImage({ title, src, downloadName, analyzed, onZoom }) { return <div><h3>{title}</h3>{src ? <div className={`detail-image${analyzed ? ' analyzed' : ''}`}><Image src={src} alt={title} fill unoptimized sizes="(max-width: 720px) 100vw, 50vw" /><div><button type="button" onClick={() => onZoom(src)}>확대</button><a href={src} download={downloadName}>다운로드</a></div><span>{analyzed ? 'AI 분석 결과' : '현장 촬영 이미지'}</span></div> : <div className="detail-image-empty"><strong>{title} 없음</strong><span>{analyzed ? 'AI 분석 결과 이미지가 저장되지 않았습니다.' : '원본 이미지가 저장되지 않았습니다.'}</span></div>}</div>; }
function Meta({ label, value }) { return <div><small>{label}</small><strong>{value}</strong></div>; }
function Step({ label, value }) { return <div><small>{label}</small><strong>{value}</strong></div>; }
