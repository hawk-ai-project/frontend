export const HOKEYTOON_SERIES_TITLE = "호키의 수상한 현장일지";

export const HOKEYTOON_EPISODES = [
  { id: 1, title: "바다에 나타난 정체불명의 괴물" },
  { id: 2, title: "완전범죄" },
  { id: 3, title: "신뢰도 51%" },
  { id: 4, title: "사진에 찍힌 범인" },
  { id: 5, title: "호키의 첫 출근" },
  { id: 6, title: "제목 준비 중" },
  { id: 7, title: "제목 준비 중" },
  { id: 8, title: "제목 준비 중" },
  { id: 9, title: "제목 준비 중" },
  { id: 10, title: "제목 준비 중" },
].map((episode) => ({
  ...episode,
  imageUrl: `/images/hokeytoon/episode-${String(episode.id).padStart(2, "0")}.png`,
}));

export function findHokeytoonEpisode(id) {
  return HOKEYTOON_EPISODES.find((episode) => episode.id === Number(id));
}
