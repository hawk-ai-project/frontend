"use client";

import { useState, useEffect } from "react";
import MenuHeader from "./MenuHeader";
import MenuList from "./MenuList";
import { menuService } from "@/services/menuService";

export default function MenuClient() {
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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
    const timer = setTimeout(fetchMenus, 0);
    return () => clearTimeout(timer);
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

      await Promise.all(
        updatedMenus.map((item) =>
          menuService.updateMenu(item.id, {
            parent_id: item.parent_id ? Number(item.parent_id) : null,
            name: item.name,
            path: item.path,
            menu_type: item.menu_type,
            sort_order: Number(item.sort_order || 0),
            is_use: Boolean(item.is_use),
            icon: item.icon || "",
            description: item.description || "",
            is_admin_only: Boolean(item.is_admin_only), // ★ 이 부분을 추가해주시면 됩니다!
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
      {createOpen && <MenuHeader onCreateMenu={handleCreateMenu} menus={menus} onClose={() => setCreateOpen(false)} />}
      <MenuList
        menus={menus}
        isLoading={isLoading}
        onSaveBatch={handleSaveBatch}
        isSaving={isSaving}
        onCreateClick={() => setCreateOpen(true)}
      />
    </>
  );
}
