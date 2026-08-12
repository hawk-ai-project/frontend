import Link from "next/link";
import { notFound } from "next/navigation";
import HokeytoonComments from "@/components/hokeytoon/HokeytoonComments";
import HokeytoonImage from "@/components/hokeytoon/HokeytoonImage";
import { findHokeytoonEpisode, HOKEYTOON_EPISODES, HOKEYTOON_SERIES_TITLE } from "@/components/hokeytoon/hokeytoonData";

export function generateStaticParams() {
  return HOKEYTOON_EPISODES.map((episode) => ({ id: String(episode.id) }));
}

export async function generateMetadata({ params }) {
  const episode = findHokeytoonEpisode((await params).id);
  return { title: episode ? `${episode.id}화 ${episode.title}` : "호키툰" };
}

export default async function HokeytoonEpisodePage({ params }) {
  const episode = findHokeytoonEpisode((await params).id);
  if (!episode) notFound();
  const previous = findHokeytoonEpisode(episode.id - 1);
  const next = findHokeytoonEpisode(episode.id + 1);

  return (
    <div className="page-shell hokeytoon-detail-page">
      <article className="hokeytoon-detail">
        <Link className="board-list-link" href="/hokeytoon">← 호키툰 목록</Link>
        <header>
          <span>{HOKEYTOON_SERIES_TITLE}</span>
          <h1>{episode.id}화. {episode.title}</h1>
        </header>
        <HokeytoonImage episode={episode} detail />
        <nav className="hokeytoon-navigation" aria-label="호키툰 회차 이동">
          {previous ? <Link href={`/hokeytoon/${previous.id}`}>← {previous.id}화 {previous.title}</Link> : <span />}
          {next ? <Link href={`/hokeytoon/${next.id}`}>{next.id}화 {next.title} →</Link> : <span />}
        </nav>
        <HokeytoonComments episodeId={episode.id} />
      </article>
    </div>
  );
}
