import React, { useState, useEffect } from "react";
import { historyService } from "@/services/historyService";

export default function ProofImageUploader({ inspectionId, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // 등록된 증빙 사진(COLLECTION_PROOF) 안전하게 불러오기
  const fetchProofImage = async () => {
    if (!inspectionId) return;
    try {
      const blob = await historyService.getHistoryImage(
        inspectionId,
        "COLLECTION_PROOF",
      );
      if (blob && blob.size > 0) {
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      }
    } catch (error) {
      // 이미지 미등록 상태 시 초기화 처리
      setPreviewUrl("");
    }
  };

  useEffect(() => {
    fetchProofImage();
  }, [inspectionId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await historyService.uploadProofImage(inspectionId, selectedFile);
      alert("수거 완료 증빙 사진이 성공적으로 등록되었습니다.");
      setSelectedFile(null);
      // 업로드 후 미리보기 갱신
      await fetchProofImage();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert("증빙 사진 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-3">
      <h4 className="text-base font-bold text-gray-800">수거 완료 증빙 사진</h4>

      {/* 미리보기 영역 */}
      <div className="w-full h-48 bg-gray-100 rounded border overflow-hidden flex items-center justify-center">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="수거 완료 증빙"
            className="max-h-full object-contain"
          />
        ) : (
          <span className="text-sm text-gray-400">
            등록된 증빙 사진이 없습니다.
          </span>
        )}
      </div>

      {/* 업로드 폼 */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300"
        >
          {uploading ? "업로드 중..." : "등록"}
        </button>
      </div>
    </div>
  );
}
