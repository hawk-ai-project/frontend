// 현장 점검 컴포넌트 (inspection/CameraPreview.jsx)

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CameraPreview.module.css";

export default function CameraPreview({ onCapture }) {
  const videoRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const streamRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [stream, setStream] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [mobileCameraOpen, setMobileCameraOpen] = useState(false);

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
        const rearCamera = videoDevices.find((device) => /back|rear|environment|후면/i.test(device.label));
        if (rearCamera) setSelectedDeviceId(rearCamera.deviceId);
      } catch (err) {
        console.error("카메라 장치를 가져오는 데 실패했습니다.", err);
      }
    };
    getDevices();
  }, []);

  // 화면을 벗어날 때 카메라 끄기
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        console.log("화면 이동 감지: 카메라 전원이 안전하게 차단되었습니다.");
      }
    };
  }, []);

  // 카메라 실행
  const startCamera = async () => {
    setPreviewImage(null);
    if (onCapture) {
      onCapture(null, "");
    }
    if (stream) stream.getTracks().forEach((track) => track.stop());
    try {
      const videoConstraints = selectedDeviceId
        ? { deviceId: { exact: selectedDeviceId } }
        : { facingMode: { ideal: "environment" } };

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });
      setStream(newStream);
      streamRef.current = newStream;
      if (videoRef.current) videoRef.current.srcObject = newStream;
      const refreshedDevices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput");
      setDevices(refreshedDevices);
      const activeDeviceId = newStream.getVideoTracks()[0]?.getSettings().deviceId;
      if (activeDeviceId) setSelectedDeviceId(activeDeviceId);
      return true;
    } catch (err) {
      console.error("카메라 권한이 없거나 오류가 발생했습니다.", err);
      setMobileCameraOpen(false);
      return false;
    }
  };

  // 카메라 선택
  useEffect(() => {
    const changeCamera = async () => {
      // stream(카메라 화면)이 이미 켜져 있을 때만 다시 켜기
      // 처음 화면에 들어왔을 때는 OFF를 유지
      if (selectedDeviceId && stream) {
        await startCamera();
      }
    };

    changeCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId]);

  // 사진 좌표를 보내는 함수
  const sendDataToParent = (imageUrl) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const coordsString = `${lat}, ${lng}`;
          console.log("[CameraPreview] GPS 획득 성공:", coordsString);

          if (onCapture) {
            onCapture(imageUrl, coordsString); // 사진과 진짜 좌표를 함께
          }
        },
        (error) => {
          console.warn("GPS를 가져올 수 없습니다:", error.message);
          if (onCapture) {
            onCapture(imageUrl, "위치 정보 없음"); // 실패 시 에러 메시지 전달
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    } else {
      if (onCapture) {
        onCapture(imageUrl, "위치 정보 없음");
      }
    }
  };

  // 카메라 캡쳐
  const captureImage = () => {
    let image = previewImage;

    // 카메라가 켜있을때만 캡쳐
    if (!image && videoRef.current && stream) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const sourceWidth = video.videoWidth;
      const sourceHeight = video.videoHeight;
      const landscapeScreen = window.matchMedia("(orientation: landscape)").matches;
      const rotateToLandscape = landscapeScreen && sourceHeight > sourceWidth;

      if (rotateToLandscape) {
        canvas.width = sourceHeight;
        canvas.height = sourceWidth;
        const orientationAngle = window.screen.orientation?.angle ?? 90;
        const activeTrack = stream.getVideoTracks()[0];
        const facingMode = activeTrack?.getSettings().facingMode;
        const selectedDevice = devices.find((device) => device.deviceId === selectedDeviceId);
        const isFrontCamera = facingMode === "user" || /front|user|전면/i.test(selectedDevice?.label || "");
        const rearRotation = orientationAngle === 270 ? Math.PI / 2 : -Math.PI / 2;
        const rotation = isFrontCamera ? -rearRotation : rearRotation;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(rotation);
        context.drawImage(video, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);
      } else {
        canvas.width = sourceWidth;
        canvas.height = sourceHeight;
        context.drawImage(video, 0, 0, sourceWidth, sourceHeight);
      }

      image = canvas.toDataURL("image/jpeg", 0.85);

      // 캡쳐된 이미지를 state에 저장
      setPreviewImage(image);

      sendDataToParent(image);
      if (mobileCameraOpen) {
        setMobileCameraOpen(false);
        stopCamera();
      }
    }
  };

  const selectImage = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  // 파일 선택 시
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        // 파일 선택 시 카메라는 끄기
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          setStream(null);
        }
        setPreviewImage(imageUrl); // 내 화면에 띄우기

        // 첨부한 사진도 page.js에게 전달
        sendDataToParent(imageUrl);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  // 카메라 끄기
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setMobileCameraOpen(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // 카메라 ON/OFF 토글
  const toggleCamera = async () => {
    if (window.matchMedia("(max-width: 600px)").matches) {
      cameraInputRef.current?.click();
      return;
    }
    if (stream) {
      stopCamera();
      return;
    }
    await startCamera();
  };

  const switchCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex((device) => device.deviceId === selectedDeviceId);
    setSelectedDeviceId(devices[(currentIndex + 1 + devices.length) % devices.length].deviceId);
  };

  useEffect(() => {
    if (!mobileCameraOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileCameraOpen]);

  return (
    <div className={`card card-pad ${styles.container}`}>
      {/* 카메라 미리보기 영역 (비디오 래퍼) */}
      <div className={`${styles.videoWrapper} ${mobileCameraOpen ? styles.mobileCameraOpen : ""}`}>
        {mobileCameraOpen && <>
          <div className={styles.mobileCameraTopbar}>
            <button type="button" onClick={stopCamera} aria-label="카메라 닫기">×</button>
            <span>현장 사진 촬영</span>
            <span aria-hidden="true" />
          </div>
          <div className={styles.mobileCameraBottomBar}>
            <span className={styles.mobileCameraControlSpacer} />
            <button type="button" className={styles.mobileShutter} onClick={captureImage} aria-label="사진 촬영"><span /></button>
            <button type="button" className={styles.mobileSwitchCamera} onClick={switchCamera} disabled={devices.length < 2} aria-label="전·후면 카메라 전환" title="카메라 전환">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h2l1.2-2h3.6L15 7h2a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3Z"/><path d="M9 13a3 3 0 0 0 5.2 2M15 12a3 3 0 0 0-5.2-2M9 10H7v-2M15 15h2v2"/></svg>
            </button>
          </div>
        </>}

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
          <div className={styles.cameraEmptyState}>
            <span className={styles.cameraEmptyIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 7.5h3.2L8.8 5h6.4l1.6 2.5H20a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13.5" r="4"/></svg>
            </span>
            <strong>촬영할 이미지를 준비해 주세요</strong>
            <p>카메라를 실행하거나 저장된 사진을 선택할 수 있습니다.</p>
          </div>
        )}
      </div>

      {/* 하단 컨트롤러 */}
      <div className={styles.controlsWrapper}>
        <div className={styles.selectGroup}>
          {/* 카메라 선택 */}
          {devices.length > 1 && (
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
          )}

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
            capture="environment"
            ref={cameraInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        {/* 촬영 및 분석 버튼 */}

        <button onClick={captureImage} className="btn btn-primary">
          사진 캡쳐
        </button>
      </div>
    </div>
  );
}
