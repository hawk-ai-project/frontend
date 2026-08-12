"use client";

import { useRef, useState } from "react";
import styles from "./HawkWalkingLoader.module.css";

const WALKING_WIDTH = 86;
const LIFTED_WIDTH = 140;

export default function HawkWalkingLoader() {
  const trackRef = useRef(null);
  const characterRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(null);
  const [trackWidth, setTrackWidth] = useState(330);

  const startDrag = (event) => {
    if (event.button !== 0) return;
    const trackRect = trackRef.current?.getBoundingClientRect();
    const characterRect = characterRef.current?.getBoundingClientRect();
    if (!trackRect || !characterRect) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOffsetRef.current = {
      x: event.clientX - characterRect.left,
      y: event.clientY - trackRect.top,
    };
    setTrackWidth(LIFTED_WIDTH);
    setPosition({ left: characterRect.left, top: trackRect.top });
    setDragging(true);
  };

  const moveDrag = (event) => {
    if (!dragging) return;
    const maxLeft = Math.max(0, window.innerWidth - LIFTED_WIDTH);
    const maxTop = Math.max(0, window.innerHeight - 130);
    setPosition({
      left: Math.min(maxLeft, Math.max(0, event.clientX - dragOffsetRef.current.x)),
      top: Math.min(maxTop, Math.max(0, event.clientY - dragOffsetRef.current.y)),
    });
  };

  const endDrag = (event) => {
    if (!dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const trackRect = trackRef.current?.getBoundingClientRect();
    const left = trackRect?.left ?? position?.left ?? 0;
    const top = trackRect?.top ?? position?.top ?? 0;
    const nextWidth = Math.max(WALKING_WIDTH, Math.min(330, window.innerWidth - left));
    setPosition({ left, top });
    setTrackWidth(nextWidth);
    setDragging(false);
  };

  return (
    <div
      ref={trackRef}
      className={`${styles.track}${dragging ? ` ${styles.dragging}` : ""}`}
      style={position ? {
        left: `${position.left}px`,
        top: `${position.top}px`,
        bottom: "auto",
        "--hawk-loader-track-width": `${trackWidth}px`,
      } : undefined}
      aria-hidden="true"
    >
      <div className={styles.mover}>
        {/* The native img element preserves the animated GIF without optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={characterRef}
          className={styles.character}
          src={dragging
            ? "/images/hawk-ai-click-lifted.gif"
            : "/images/hawk-ai-walking-loader-transparent.gif"}
          alt=""
          draggable="false"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      </div>
    </div>
  );
}
