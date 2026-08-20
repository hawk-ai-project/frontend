"use client";

import { useState, useEffect } from "react";
import MenuHeader from "./MenuHeader";
import MenuList from "./MenuList";
import { menuService } from "@/services/menuService";

export default function MenuClient() {
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const data = await menuService.getAllMenus();
      setMenus(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("메뉴 목록 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleCreateMenu = async (formData) => {
    try {
      const payload = {
        ...formData,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        sort_order: Number(formData.sort_order),
      };
      await menuService.createMenu(payload);
      alert("메뉴가 성공적으로 등록되었습니다.");
      fetchMenus();
      return true;
    } catch (err) {
      alert("메뉴 등록 중 오류가 발생했습니다.");
      return false;
    }
  };

  const handleSaveBatch = async (updatedMenus) => {
    try {
      setIsSaving(true);

      // 5개 핵심 요소(메뉴명, 경로, 유형, 순서, 상태) 포함 전체 필드 업데이트
      await Promise.all(
        updatedMenus.map((item) =>
          menuService.updateMenu(item.id, {
            parent_id: item.parent_id ? Number(item.parent_id) : null,
            name: item.name, // 1. 메뉴명
            path: item.path, // 2. 경로
            menu_type: item.menu_type, // 3. 유형
            sort_order: Number(item.sort_order || 0), // 4. 순서
            is_use: Boolean(item.is_use), // 5. 상태 (사용 여부)
            icon: item.icon || "",
            description: item.description || "",
          }),
        ),
      );

      alert("변경사항이 성공적으로 저장되었습니다.");
      fetchMenus();
    } catch (err) {
      console.error("메뉴 저장 실패:", err);
      alert("메뉴 수정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <MenuHeader onCreateMenu={handleCreateMenu} menus={menus} />
      <MenuList
        menus={menus}
        isLoading={isLoading}
        onSaveBatch={handleSaveBatch}
        isSaving={isSaving}
      />
    </>
  );
}
