"use client";

import BoardComments from "@/components/board/BoardComments";
import { hokeytoonService } from "@/services/hokeytoonService";

export default function HokeytoonComments({ episodeId }) {
  return <BoardComments resourceId={episodeId} commentService={hokeytoonService} />;
}
