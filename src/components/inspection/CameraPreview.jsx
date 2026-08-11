// 현장 점검 컴포넌트 (inspection/CameraPreview.jsx)

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CameraPreview.module.css";

export default function CameraPreview() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [stream, setStream] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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
    const initCamera = async () => {
      if (selectedDeviceId) {
        await startCamera();
      }
    };
    initCamera();
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

          {/* 카메라 재연결 버튼 */}
          <button onClick={startCamera} className="btn btn-secondary">
            카메라 재연결
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
        <button onClick={handleCapture} className="btn btn-primary">
          촬영 및 분석
        </button>
      </div>
    </div>
  );
}
