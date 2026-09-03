const ROLE_MAP = {
  USER: "user",
  BOT: "assistant",
};

export function buildChatHistory(messages, currentMessage, limit = 12) {
  // 환영·오류 메시지를 제외하고 AI 서버가 이해하는 role로 정규화
  const normalized = messages
    .filter((item) => item.id !== "welcome" && ROLE_MAP[item.role])
    .map((item) => ({
      role: ROLE_MAP[item.role],
      content: String(item.text || "").trim(),
    }))
    .filter((item) => item.content && item.content.length <= 500);

  const current = String(currentMessage || "").trim();

  // 현재 질문은 별도 message로 전송되므로 history의 중복 항목을 제거
  if (
    normalized.at(-1)?.role === "user"
    && normalized.at(-1)?.content === current
  ) {
    normalized.pop();
  }
  return normalized.slice(-limit);
}
