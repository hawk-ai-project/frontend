'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { STATUS_OPTIONS, statusClass } from './historyData';

const formatDateTime = (value) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value));

export default function HistoryDetailClient({ history, detail }) {
  const [status, setStatus] = useState(history.status);
  const [opinion, setOpinion] = useState(detail.opinion);
  const [saved, setSaved] = useState(true);
  const [afterImage, setAfterImage] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const source = history.waste === 'PET Bottle' ? '/images/home/pet-bottles.png' : '/images/home/main-analysis.png';
  const currentStep = status === '완료' ? '완료' : status === '진행' ? '진행' : '대기';
  return <div className="page-shell history-detail-page compact-detail-page">
    <div className="detail-header"><div><div className="eyebrow">Inspection Detail</div><h1>점검 상세 <span>#{history.id}</span></h1><p>점검 결과를 확인하고 후속 조치와 처리 상태를 관리하세요.</p></div><div className="detail-header-actions"><Link className="btn btn-soft" href={`/boards/write?inspectionId=${encodeURIComponent(history.id)}`}>게시글 작성</Link><Link className="btn btn-primary" href="/histories">목록</Link><label>처리 상태<select value={status} onChange={(event) => setStatus(event.target.value)}>{STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label><button className="btn btn-primary" type="button" onClick={() => setStatus('완료')}>수거 작업 완료 처리</button></div></div>
    <div className="compact-top-grid"><article className="card compact-image-card"><div className="detail-image-grid"><DetailImage title="원본 이미지" src={source} onZoom={setZoomImage} /><DetailImage title="분석 이미지" src="/images/home/main-analysis.png" analyzed onZoom={setZoomImage} /></div></article><article className="card compact-summary-card"><h2>점검 요약</h2><div className="compact-meta-grid"><Meta label="처리 상태" value={<span className={`badge ${statusClass(status)}`}>{status}</span>} /><Meta label="점검 일시" value={formatDateTime(history.inspectedAt)} /><Meta label="점검 장소" value={detail.fullLocation} /><Meta label="점검자" value={detail.inspector} /><Meta label="GPS 좌표" value={detail.coordinates} /><Meta label="현장 위치" value={<a href={`https://www.google.com/maps?q=${detail.coordinates}`} target="_blank" rel="noreferrer">지도 보기</a>} /></div><h3>탐지 결과</h3><div className="detection-tags">{detail.detections.map(([name, count]) => <span key={name}>{name} <b>{count}개</b></span>)}</div></article></div>
    <div className="compact-action-grid"><article className="card card-pad after-card"><h2>수거 완료 증빙 사진</h2><label className="after-photo-upload">{afterImage ? <img src={afterImage} alt="수거 완료 증빙 사진" /> : <><b>+ 사진 등록</b><span>수거 완료 후 현장 사진을 첨부하세요.</span></>}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) setAfterImage(URL.createObjectURL(file)); }} /></label></article><article className="card card-pad opinion-card"><div className="detail-card-title"><h2>점검 의견 및 후속 조치</h2><button className="btn btn-primary" type="button" onClick={() => setSaved(true)}>저장</button></div><textarea value={opinion} onChange={(event) => { setOpinion(event.target.value); setSaved(false); }} /><small>{saved ? '저장된 내용입니다.' : '수정된 내용이 있습니다.'}</small></article></div>
    <article className="card card-pad detail-process"><div className="detail-card-title"><h2>처리 이력</h2><button className="btn btn-soft" type="button">담당자 지정</button></div><div className="detail-process-steps"><Step label="1단계 · 점검 등록" value="AI 점검 결과 저장" /><Step label="2단계 · 담당자 배정" value="담당자 미지정" /><Step label="3단계 · 수거/조치" value={currentStep} /><Step label="4단계 · 완료" value={status === '완료' ? '완료' : '대기'} /></div></article>
    {zoomImage && <div className="detail-image-modal" onClick={() => setZoomImage(null)}><div onClick={(event) => event.stopPropagation()}><button onClick={() => setZoomImage(null)}>×</button><img src={zoomImage} alt="점검 이미지 확대" /></div></div>}
  </div>;
}
function DetailImage({ title, src, analyzed, onZoom }) { return <div><h3>{title}</h3><div className={`detail-image${analyzed ? ' analyzed' : ''}`}><Image src={src} alt={title} fill sizes="(max-width: 720px) 100vw, 50vw" /><div><button type="button" onClick={() => onZoom(src)}>확대</button><a href={src} download>다운로드</a></div><span>{analyzed ? 'AI 분석 결과' : '현장 촬영 이미지'}</span></div></div>; }
function Meta({ label, value }) { return <div><small>{label}</small><strong>{value}</strong></div>; }
function Step({ label, value }) { return <div><small>{label}</small><strong>{value}</strong></div>; }
