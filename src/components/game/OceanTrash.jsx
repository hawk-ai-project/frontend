"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./OceanCleanupGame.module.css";

export default function OceanTrash({ item, binRef, onCollected, onMissed }) {
  const imageRef = useRef(null);
  const frameRef = useRef(null);
  const positionRef = useRef({ x: item.x, y: item.y });
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const move = (time) => {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const elapsed = Math.min(32, time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      if (!draggingRef.current) {
        const position = positionRef.current;
        position.x += item.vx * elapsed;
        position.y += item.vy * elapsed;
        const bob = Math.sin(time / 420 + item.phase) * 5;
        if (imageRef.current) {
          imageRef.current.style.transform = `translate3d(${position.x}px, ${position.y + bob}px, 0) rotate(${item.rotation + time * item.rotationSpeed / 1000}deg)`;
        }
        const margin = item.size + 30;
        if (position.x < -margin || position.x > window.innerWidth + margin || position.y > window.innerHeight + margin) {
          onMissed(item.id);
          return;
        }
      }
      frameRef.current = window.requestAnimationFrame(move);
    };
    frameRef.current = window.requestAnimationFrame(move);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [item, onMissed]);

  const startDrag = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOffsetRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    draggingRef.current = true;
    setDragging(true);
  };

  const moveDrag = (event) => {
    if (!draggingRef.current) return;
    positionRef.current = {
      x: event.clientX - dragOffsetRef.current.x,
      y: event.clientY - dragOffsetRef.current.y,
    };
    if (imageRef.current) imageRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
  };

  const endDrag = (event) => {
    if (!draggingRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    draggingRef.current = false;
    setDragging(false);
    const trashRect = imageRef.current?.getBoundingClientRect();
    const binRect = binRef.current?.getBoundingClientRect();
    if (!trashRect || !binRect) return;
    const centerX = trashRect.left + trashRect.width / 2;
    const centerY = trashRect.top + trashRect.height / 2;
    if (centerX >= binRect.left && centerX <= binRect.right && centerY >= binRect.top && centerY <= binRect.bottom) {
      onCollected(item);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      className={`${styles.trash}${dragging ? ` ${styles.draggingTrash}` : ""}`}
      src={item.image}
      alt={`${item.type} 해양 쓰레기`}
      draggable="false"
      style={{ width: item.size, height: item.size }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    />
  );
}
