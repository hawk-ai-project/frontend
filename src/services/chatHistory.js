const ROLE_MAP = {
  USER: "user",
  BOT: "assistant",
};

export function buildChatHistory(messages, currentMessage, limit = 12) {
  const normalized = messages
    .filter((item) => item.id !== "welcome" && ROLE_MAP[item.role])
    .map((item) => ({
      role: ROLE_MAP[item.role],
      content: String(item.text || "").trim(),
    }))
    .filter((item) => item.content && item.content.length <= 500);

  const current = String(currentMessage || "").trim();
  if (
    normalized.at(-1)?.role === "user"
    && normalized.at(-1)?.content === current
  ) {
    normalized.pop();
  }
  return normalized.slice(-limit);
}
