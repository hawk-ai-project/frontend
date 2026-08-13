"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import OceanCleanupGame from "@/components/game/OceanCleanupGame";
import styles from "./HawkWalkingLoader.module.css";

const WALKING_WIDTH = 86;
const LIFTED_WIDTH = 140;
const MENU_WIDTH = 250;
const MENU_HEIGHT = 330;
const VIEWPORT_GAP = 12;

const ACTIONS = {
  walking: { image: "/images/hawk-ai-walking-loader-transparent.gif", label: "걸어 다니는 호키" },
  feeding: { image: "/images/hokey-feeding.gif", label: "밥을 먹는 호키", message: "냠냠! 호키 충전 완료!", duration: 4000 },
  bonk: { image: "/images/hokey-bonk-crying.gif", label: "꿀밤을 맞고 우는 호키", message: "아야… 너무해!", duration: 4000 },
  sleeping: { image: "/images/hokey-sleeping-loop.gif", label: "잠자는 호키", message: "호키는 꿈속 점검 중… Zzz" },
  petting: { image: "/images/hokey-petting.gif", label: "쓰다듬기를 좋아하는 호키", message: "헤헤, 한 번 더!", duration: 4000 },
};

const MENU_ACTIONS = [
  { action: "feeding", icon: "🍚", label: "밥 주기" },
  { action: "bonk", icon: "💢", label: "꿀밤 주기" },
  { action: "sleeping", icon: "🌙", label: "재우기" },
  { action: "petting", icon: "💕", label: "쓰다듬기" },
];

export default function HawkWalkingLoader() {
  const pathname = usePathname();
  const trackRef = useRef(null);
  const characterRef = useRef(null);
  const menuRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const actionTimerRef = useRef(null);
  const messageTimerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(null);
  const [trackWidth, setTrackWidth] = useState(330);
  const [action, setAction] = useState("walking");
  const [message, setMessage] = useState("");
  const [menuPosition, setMenuPosition] = useState(null);
  const [gameOpen, setGameOpen] = useState(false);

  const clearActionTimer = useCallback(() => {
    if (actionTimerRef.current) window.clearTimeout(actionTimerRef.current);
    actionTimerRef.current = null;
  }, []);

  const showMessage = useCallback((text) => {
    if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
    setMessage(text);
    messageTimerRef.current = window.setTimeout(() => setMessage(""), 3000);
  }, []);

  const selectAction = useCallback((nextAction) => {
    setMenuPosition(null);
    clearActionTimer();

    if (nextAction === "playing") {
      setAction("walking");
      setGameOpen(true);
      return;
    }

    if (nextAction === "sleeping" && action === "sleeping") {
      setAction("walking");
      showMessage("잘 잤다! 다시 출동!");
      return;
    }

    const next = ACTIONS[nextAction];
    setAction(nextAction);
    showMessage(next.message);
    if (next.duration) {
      actionTimerRef.current = window.setTimeout(() => {
        setAction("walking");
        actionTimerRef.current = null;
      }, next.duration);
    }
  }, [action, clearActionTimer, showMessage]);

  const openMenu = (event) => {
    if (pathname !== "/" || !window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches) return;
    event.preventDefault();
    const characterRect = characterRef.current?.getBoundingClientRect();
    const anchorX = event.clientX || (characterRect ? characterRect.right : VIEWPORT_GAP);
    const anchorY = event.clientY || (characterRect ? characterRect.top : VIEWPORT_GAP);
    setMenuPosition({
      left: Math.max(VIEWPORT_GAP, Math.min(anchorX + 8, window.innerWidth - MENU_WIDTH - VIEWPORT_GAP)),
      top: Math.max(VIEWPORT_GAP, Math.min(anchorY + 8, window.innerHeight - MENU_HEIGHT - VIEWPORT_GAP)),
    });
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMenuPosition(null);
      if (pathname !== "/") setGameOpen(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!menuPosition) return undefined;
    const close = () => setMenuPosition(null);
    const closeOnPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) close();
    };
    const closeOnKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnKeyDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnKeyDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [menuPosition]);

  useEffect(() => () => {
    clearActionTimer();
    if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
  }, [clearActionTimer]);

  const startDrag = (event) => {
    if (event.button !== 0) return;
    setMenuPosition(null);
    const trackRect = trackRef.current?.getBoundingClientRect();
    const characterRect = characterRef.current?.getBoundingClientRect();
    if (!trackRect || !characterRect) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOffsetRef.current = { x: event.clientX - characterRect.left, y: event.clientY - trackRect.top };
    setTrackWidth(LIFTED_WIDTH);
    setPosition({ left: characterRect.left, top: trackRect.top });
    setDragging(true);
  };

  const moveDrag = (event) => {
    if (!dragging) return;
    setPosition({
      left: Math.min(Math.max(0, window.innerWidth - LIFTED_WIDTH), Math.max(0, event.clientX - dragOffsetRef.current.x)),
      top: Math.min(Math.max(0, window.innerHeight - 130), Math.max(0, event.clientY - dragOffsetRef.current.y)),
    });
  };

  const endDrag = (event) => {
    if (!dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const trackRect = trackRef.current?.getBoundingClientRect();
    const left = trackRect?.left ?? position?.left ?? 0;
    const top = trackRect?.top ?? position?.top ?? 0;
    setPosition({ left, top });
    setTrackWidth(Math.max(WALKING_WIDTH, Math.min(330, window.innerWidth - left)));
    setDragging(false);
  };

  const image = dragging ? "/images/hawk-ai-click-lifted.gif" : ACTIONS[action].image;

  return (
    <>
      <div
        ref={trackRef}
        className={`${styles.track}${dragging ? ` ${styles.dragging}` : ""}${action !== "walking" ? ` ${styles.acting}` : ""}${gameOpen ? ` ${styles.gameHidden}` : ""}`}
        style={position ? { left: `${position.left}px`, top: `${position.top}px`, bottom: "auto", "--hawk-loader-track-width": `${trackWidth}px` } : undefined}
      >
        {message && <div className={styles.speech} role="status">{message}</div>}
        <div className={styles.mover}>
          {/* Native img preserves animated GIF playback. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={characterRef}
            className={styles.character}
            src={image}
            alt={dragging ? "옮겨지는 호키" : ACTIONS[action].label}
            aria-label="호키 행동 메뉴 열기"
            tabIndex={pathname === "/" ? 0 : -1}
            draggable="false"
            onContextMenu={openMenu}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        </div>
      </div>
      {menuPosition && (
        <div
          ref={menuRef}
          className={styles.actionMenu}
          style={{ left: menuPosition.left, top: menuPosition.top }}
          role="menu"
          aria-label="호키 행동 선택"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <strong>오늘은 호키랑 뭘 할까?</strong>
          {MENU_ACTIONS.map((item) => {
            const waking = item.action === "sleeping" && action === "sleeping";
            return (
              <button
                key={item.action}
                type="button"
                role="menuitemradio"
                aria-checked={action === item.action}
                className={action === item.action ? styles.selected : ""}
                onClick={() => selectAction(item.action)}
              >
                <span aria-hidden="true">{waking ? "☀️" : item.icon}</span>
                {waking ? "호키 깨우기" : item.label}
              </button>
            );
          })}
          <button type="button" role="menuitem" onClick={() => selectAction("playing")}>
            <span aria-hidden="true">🌊</span>놀아주기
          </button>
        </div>
      )}
      {gameOpen && <OceanCleanupGame onClose={() => setGameOpen(false)} />}
    </>
  );
}
