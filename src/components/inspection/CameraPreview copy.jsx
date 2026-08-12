// 현장 점검 컴포넌트 (inspection/CameraPreview.jsx)

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CameraPreview.module.css";

export default function CameraPreview({ onCapture, onSubmit }) {
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
    const changeCamera = async () => {
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

  // 현재 위치 가져오기
  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) =>
            resolve(
              `${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`,
            ),
          (error) => {
            console.warn("위치 정보를 가져올 수 없습니다.", error);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 5000 },
        );
      } else {
        resolve(null);
      }
    });
  };

  // 촬영 및 분석
  const handleCapture = async () => {
    let finalImageUrl = previewImage;

    if (!finalImageUrl && videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      finalImageUrl = canvas.toDataURL("image/jpeg", 0.8);
    }

    if (finalImageUrl) {
      // 사진 찍은 직후 GPS 좌표 가져오기
      const coords = await getCoordinates();

      if (onCapture) onCapture(finalImageUrl, coords);
      if (onSubmit) onSubmit();
    } else {
      alert("먼저 카메라를 켜거나 사진을 첨부해 주세요!");
    }
  };

  // 사진 첨부
  const selectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target.result;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        setPreviewImage(imageUrl);

        const coords = await getCoordinates();
        if (onCapture) onCapture(imageUrl, coords);
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
            카메라를 연결해주세요.
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
        <button onClick={handleCapture} className="btn btn-primary">
          촬영 및 분석
        </button>
      </div>
    </div>
  );
}
