"use client";

import { useState } from "react";

export default function HokeytoonImage({ episode, detail = false }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`hokeytoon-image${detail ? " is-detail" : ""}${failed ? " is-empty" : ""}`}>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={episode.imageUrl} alt={`${episode.id}화 ${episode.title}`} onError={() => setFailed(true)} />
      )}
      {failed && <span><b>{episode.id}화</b><small>이미지를 준비하고 있습니다.</small></span>}
    </div>
  );
}
