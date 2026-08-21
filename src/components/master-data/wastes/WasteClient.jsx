"use client";

import { useState, useEffect, useCallback } from "react";
import { wastesService } from "@/services/wastesService";
import WasteList from "./WasteList";

export default function WasteClient() {
  const [wastes, setWastes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchWastes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await wastesService.getWasteTypes();
      setWastes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("폐기물 목록을 불러오는데 실패했습니다.", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWastes();
  }, [fetchWastes]);

  // 일괄 저장 (신규 생성, 수정, 삭제 일괄 처리)
  const handleSaveBatch = async ({ toCreate, toUpdate, toDelete }) => {
    setIsSaving(true);
    try {
      // 1. 신규 등록
      if (toCreate.length > 0) {
        await Promise.all(
          toCreate.map((item) => wastesService.createWasteType(item)),
        );
      }
      // 2. 수정
      if (toUpdate.length > 0) {
        await Promise.all(
          toUpdate.map((item) => wastesService.updateWasteType(item.id, item)),
        );
      }
      // 3. 삭제 (real delete)
      if (toDelete.length > 0) {
        await Promise.all(
          toDelete.map((id) => wastesService.deleteWasteType(id)),
        );
      }

      alert("성공적으로 저장되었습니다.");
      await fetchWastes();
    } catch (err) {
      console.error("저장 중 오류 발생:", err);
      alert("저장 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <WasteList
      wastes={wastes}
      isLoading={isLoading}
      isSaving={isSaving}
      onSaveBatch={handleSaveBatch}
    />
  );
}
