"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { inspectionService } from "@/services/inspectionService";
import styles from "./CameraPreview.module.css";

export default function CameraPreview() {
  const router = useRouter();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [stream, setStream] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices()
      .then((items) => {
        const cameras = items.filter((item) => item.kind === "videoinput");
        setDevices(cameras);
        if (cameras.length) setSelectedDeviceId(cameras[0].deviceId);
      })
      .catch(() => setSubmitError("카메라 장치를 확인하지 못했습니다."));
  }, []);

  useEffect(() => () => {
    if (stream) stream.getTracks().forEach((track) => track.stop());
  }, [stream]);

  const startCamera = async () => {
    if (stream) stream.getTracks().forEach((track) => track.stop());
    setPreviewImage(null);
    setSubmitError("");
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined },
      });
      setStream(nextStream);
      if (videoRef.current) videoRef.current.srcObject = nextStream;
    } catch {
      setSubmitError("카메라 권한을 확인해 주세요.");
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((track) => track.stop());
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSubmitError("이미지 파일만 첨부할 수 있습니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      stopCamera();
      setPreviewImage(reader.result);
      setSubmitError("");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const captureImage = () => {
    if (previewImage) return previewImage;
    if (!videoRef.current || !stream) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg", 0.85);
    setPreviewImage(image);
    return image;
  };

  const handleCapture = async () => {
    const image = captureImage();
    const location = document.getElementById("location")?.value?.trim();
    const notes = document.getElementById("memo")?.value?.trim() || null;
    if (!image) return setSubmitError("분석할 사진을 촬영하거나 첨부해 주세요.");
    if (!location) return setSubmitError("점검 장소를 입력해 주세요.");
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await inspectionService.create({
        image, title: `${location} 현장점검`, location, notes,
      });
      router.push(`/histories/inspection/${result.inspectionId}`);
    } catch (error) {
      const detail = error.response?.data?.detail;
      setSubmitError(typeof detail === "string" ? detail : "점검 분석 및 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return <div className={`card card-pad ${styles.container}`}>
    <div className={styles.videoWrapper}>
      <div className={styles.statusWrapper}><span className={`badge ${stream ? `done ${styles.badgeConnected}` : styles.badgeWaiting}`}><span className={`${styles.indicator} ${stream ? styles.indicatorConnected : styles.indicatorWaiting}`} />{stream ? "카메라 연결됨" : previewImage ? "사진 첨부됨" : "연결 대기 중"}</span></div>
      {previewImage ? <img src={previewImage} alt="첨부한 현장 사진" className={styles.videoElement} style={{ objectFit: "contain", width: "100%", maxHeight: "100%" }} /> : <video ref={videoRef} autoPlay playsInline muted className={styles.videoElement} style={{ display: stream ? "block" : "none" }} />}
      {!stream && !previewImage && <div className={`badge ${styles.placeholderBadge}`}>USB Camera Preview</div>}
    </div>
    <div className={styles.controlsWrapper}>
      <div className={styles.selectGroup}>
        <select className={`input ${styles.selectInput}`} value={selectedDeviceId} onChange={(event) => setSelectedDeviceId(event.target.value)}>{devices.length === 0 && <option value="">카메라 없음</option>}{devices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>)}</select>
        <button type="button" onClick={stream ? stopCamera : startCamera} className="btn btn-secondary">{stream ? "카메라 OFF" : "카메라 ON"}</button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">사진 첨부</button>
        <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={handleFileChange} />
      </div>
      <button type="button" onClick={handleCapture} className="btn btn-primary" disabled={submitting}>{submitting ? "분석 및 저장 중..." : "촬영 및 분석"}</button>
    </div>
    {submitError && <p className="board-state board-state-error">{submitError}</p>}
  </div>;
}
