import Link from "next/link";
import HokeytoonImage from "@/components/hokeytoon/HokeytoonImage";
import { HOKEYTOON_EPISODES, HOKEYTOON_SERIES_TITLE } from "@/components/hokeytoon/hokeytoonData";

export const metadata = { title: "호키툰" };

export default function HokeytoonPage() {
  return (
    <div className="page-shell hokeytoon-page">
      <div className="page-head hokeytoon-head">
        <div>
          <span className="hokeytoon-kicker">HAWK-AI ORIGINAL</span>
          <h1>{HOKEYTOON_SERIES_TITLE}</h1>
          <p>호키가 마주한 수상한 환경 점검 현장을 4컷 만화로 만나보세요.</p>
        </div>
      </div>
      <div className="hokeytoon-grid">
        {HOKEYTOON_EPISODES.map((episode) => (
          <Link className="hokeytoon-card" href={`/hokeytoon/${episode.id}`} key={episode.id}>
            <HokeytoonImage episode={episode} />
            <div><span>{episode.id}화</span><h2>{episode.title}</h2><p>4컷 만화 보기 →</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
