"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { favoriteService } from "@/services/favoriteService";
import { NAVIGATION } from "@/constants/routes";

export const FloatingFavoriteWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const pathname = usePathname();

  // 중복 호출 및 삭제 직후 재등록 방지용 Ref
  const lastRecordedPath = useRef(null);
  const deletedPaths = useRef(new Set());

  // 즐겨찾기 목록 조회
  const fetchFavorites = async () => {
    try {
      const data = await favoriteService.getTop5Favorites();
      setFavorites(data || []);
    } catch (err) {
      console.error("즐겨찾기 조회 실패:", err);
    }
  };

  // 1. 위젯 팝업이 열릴 때 목록 조회
  useEffect(() => {
    if (isOpen) {
      fetchFavorites();
    }
  }, [isOpen]);

  // 2. 경로(pathname) 변경 시 1회만 자동 수집 (중복 방지)
  useEffect(() => {
    if (!pathname) return;

    if (pathname === "/" || pathname === "") return;

    if (
      lastRecordedPath.current === pathname ||
      deletedPaths.current.has(pathname)
    ) {
      return;
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("hawk_ai_access_token")
        : null;
    if (!token) return;

    const autoRecordVisit = async () => {
      try {
        lastRecordedPath.current = pathname;

        setTimeout(async () => {
          const matchedNav = NAVIGATION.find((nav) => nav.href === pathname);
          let pageTitle = matchedNav ? matchedNav.label : null;

          if (!pageTitle) {
            pageTitle = document.title
              ? document.title.replace(/\s*\|\s*Hawk-AI/g, "").trim()
              : "";

            if (!pageTitle || pageTitle === "Hawk-AI") {
              pageTitle = "페이지";
            }
          }

          await favoriteService.logPageVisit({
            title: pageTitle,
            path: pathname,
            icon: "bookmark",
          });

          if (isOpen) {
            fetchFavorites();
          }
        }, 300);
      } catch (err) {
        console.warn("방문 기록 수집 실패:", err?.response?.status);
      }
    };

    autoRecordVisit();
  }, [pathname]);

  // 즐겨찾기 메뉴 클릭 시
  const handleFavoriteClick = async (fav) => {
    try {
      await favoriteService.recordClick(fav.id);
    } catch (err) {
      console.error("방문 기록 업데이트 실패:", err);
    } finally {
      window.location.href = fav.path;
    }
  };

  // 즐겨찾기 삭제 시
  const handleDelete = async (id, path, e) => {
    e.stopPropagation();
    try {
      await favoriteService.deleteFavorite(id);

      if (path) {
        deletedPaths.current.add(path);
      }

      setFavorites((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("즐겨찾기 삭제 실패:", err);
    }
  };

  return (
    <div
      className="favorite-floating-container"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {isOpen && (
        <div className="favorite-popup-card">
          <div className="favorite-popup-header">
            <div className="favorite-popup-title">
              <span>★</span>
              {/* 💡 헤더 텍스트 Top 3로 변경 */}
              <span>자주 방문한 메뉴 (Top 3)</span>
            </div>
          </div>

          <div className="favorite-popup-body">
            {favorites.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">
                방문 기록이 없습니다.
              </p>
            ) : (
              /* 💡 Top 3개만 노출되도록 slice(0, 3) 적용 */
              favorites.slice(0, 3).map((fav) => (
                <div
                  key={fav.id}
                  onClick={() => handleFavoriteClick(fav)}
                  className="favorite-item-card"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🔖</span>
                    <span className="favorite-item-title">{fav.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="favorite-badge">{fav.visit_count}회</span>
                    <button
                      onClick={(e) => handleDelete(fav.id, fav.path, e)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <button className="favorite-fab-btn" aria-label="즐겨찾기">
        {isOpen ? "✕" : "★"}
      </button>
    </div>
  );
};
