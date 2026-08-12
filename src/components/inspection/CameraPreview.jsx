// 현장 점검 컴포넌트 (inspection/CameraPreview.jsx)

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

  // 카메라 불러오기
  useEffect(() => {
    const getDevices = async () => {
      try {
        const connectedDevices =
          await navigator.mediaDevices.enumerateDevices();
        const videoDevices = connectedDevices.filter(
          (device) => device.kind === "videoinput",
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0)
          setSelectedDeviceId(videoDevices[0].deviceId);
      } catch (err) {
        console.error("카메라 장치를 가져오는 데 실패했습니다.", err);
      }
    };
    getDevices();
  }, []);

  // 카메라 실행
  const startCamera = async () => {
    setPreviewImage(null);
    if (stream) stream.getTracks().forEach((track) => track.stop());
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        },
      });
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch (err) {
      console.error("카메라 권한이 없거나 오류가 발생했습니다.", err);
    }
  };

  // 카메라 선택
  useEffect(() => {
    const changeCamera = async () => {
      // 핵심: stream(카메라 화면)이 이미 켜져 있을 때만 다시 켭니다!
      // 처음 화면에 들어왔을 때(stream이 null일 때)는 무시하고 OFF를 유지합니다.
      if (selectedDeviceId && stream) {
        await startCamera();
      }
    };

    changeCamera();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId]);

  // 촬영 및 분석
  const handleCapture = () => {
    if (previewImage) {
      console.log("분석할 첨부 이미지 : ", previewImage);
      alert("첨부된 사진으로 분석을 시작합니다.");
    } else if (videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
      console.log("캡처된 이미지:", imageUrl);
      alert("촬영이 완료되었습니다!");
    }
  };

  // 사진 첨부
  const saveInspection = async () => {
    let image = previewImage;
    if (!image && videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      image = canvas.toDataURL("image/jpeg", 0.85);
      setPreviewImage(image);
    }
    const location = document.getElementById("location")?.value?.trim();
    if (!image) return setSubmitError("사진을 촬영하거나 첨부해 주세요.");
    if (!location) return setSubmitError("점검 장소를 입력해 주세요.");
    const latitude = document.getElementById("latitude")?.value;
    const longitude = document.getElementById("longitude")?.value;
    setSubmitting(true); setSubmitError("");
    try {
      const result = await inspectionService.create({
        image, title: `${location} 현장점검`, location,
        notes: document.getElementById("memo")?.value || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      });
      router.push(`/histories/inspection/${result.inspectionId}`);
    } catch (error) {
      setSubmitError(error.response?.data?.detail || "점검 분석 및 저장에 실패했습니다.");
    } finally { setSubmitting(false); }
  };

  const selectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        setPreviewImage(imageUrl);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  // 카메라 끄기
  const stopCamera = () => {
    if (stream) {
      // 카메라 하드웨어 중지
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // 카메라 ON/OFF 토글
  const toggleCamera = () => {
    if (stream) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className={`card card-pad ${styles.container}`}>
      {/* 카메라 미리보기 영역 (비디오 래퍼) */}
      <div className={styles.videoWrapper}>
        {/* 상태 표시 */}
        <div className={styles.statusWrapper}>
          {stream ? (
            <span className={`badge done ${styles.badgeConnected}`}>
              <span
                className={`${styles.indicator} ${styles.indicatorConnected}`}
              ></span>
              카메라 연결됨
            </span>
          ) : (
            <span className={`badge ${styles.badgeWaiting}`}>
              <span
                className={`${styles.indicator} ${styles.indicatorWaiting}`}
              ></span>
              연결 대기중
            </span>
          )}
        </div>

        {/* 사진이 있으면 img태그, 없으면 video태그 */}
        {previewImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={previewImage}
            alt="첨부된 사진"
            className={styles.videoElement}
            style={{ objectFit: "contain", width: "100%", maxHeight: "100%" }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.videoElement}
            style={{ display: stream ? "block" : "none" }}
          />
        )}

        {/* 카메라 출력 안하고 있을 때 */}
        {!stream && !previewImage && (
          <div className={`badge ${styles.placeholderBadge}`}>
            USB Camera Preview
          </div>
        )}
      </div>

      {/* 하단 컨트롤러 */}
      <div className={styles.controlsWrapper}>
        <div className={styles.selectGroup}>
          {/* 카메라 선택 */}
          <select
            className={`input ${styles.selectInput}`}
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
          >
            {devices.length === 0 && <option value="">카메라 없음</option>}
            {devices.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>

          {/* 카메라 ON/OFF 버튼 */}
          <button onClick={toggleCamera} className="btn btn-secondary">
            {stream ? "카메라 OFF" : "카메라 ON"}
          </button>

          <button onClick={selectImage} className="btn btn-secondary">
            사진 첨부
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        {/* 촬영 및 분석 버튼 */}
        <button onClick={saveInspection} className="btn btn-primary" disabled={submitting}>
          {submitting ? "분석 및 저장 중..." : "촬영 및 분석"}
        </button>
      </div>
      {submitError && <p className="board-state board-state-error">{submitError}</p>}
    </div>
  );
}
