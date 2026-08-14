const SAFE_CHARACTER = /[\t\n\r\x20-\x7E\u00B7\u2013-\u201D\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;

function cleanText(value) {
  if (typeof value !== "string") return "";
  const decoded = value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_match, hex) => {
      const codePoint = Number.parseInt(hex, 16);
      if (codePoint >= 0xD800 && codePoint <= 0xDFFF) return "";
      return String.fromCodePoint(codePoint);
    })
    .replace(/\\u[0-9a-fA-F]{0,3}/g, "");
  const characters = [...decoded].filter((character) => SAFE_CHARACTER.test(character));
  const seen = new Set();
  return characters.join("")
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line) => {
      if (!line || seen.has(line)) return false;
      seen.add(line);
      return true;
    })
    .join("\n\n")
    .trim();
}

function looksLikeSerializedDraft(value) {
  return typeof value === "string"
    && /^\s*(?:```json\s*)?\{/.test(value)
    && /"(?:title|summary|content)"\s*:/i.test(value);
}

function hasCorruptEscapeJunk(value) {
  if (typeof value !== "string") return true;
  if ((value.match(/\\/g) || []).length >= 2) return true;
  return /\\[^nrt\\"'`*#()[\]{}+\-]/.test(value);
}

function fallbackDraft() {
  return {
    title: "점검 현장 점검 결과",
    summary: "AI 생성 결과를 확인해 주세요.",
    content: "## 점검 결과\n\nAI 초안에 손상된 데이터가 있어 안전한 내용으로 교체했습니다. 필요한 내용을 다시 생성하거나 직접 입력해 주세요.",
  };
}

export function sanitizeBoardDraft(draft) {
  const source = draft && typeof draft === "object" ? draft : {};
  const fields = [source.title, source.summary, source.content];
  if (source.title === "Inspection site inspection result" || (
    typeof source.content === "string"
    && source.content.includes("## Inspection result")
    && source.content.includes("Location: Inspection site")
  )) return { ...source, ...fallbackDraft() };
  if (fields.some(hasCorruptEscapeJunk)) return { ...source, ...fallbackDraft() };
  const serialized = fields.find(looksLikeSerializedDraft);

  if (serialized) {
    try {
      const parsed = JSON.parse(serialized.replace(/^\s*```json\s*|\s*```\s*$/gi, ""));
      if (parsed && typeof parsed === "object" && !fields.some((value) => value !== serialized && looksLikeSerializedDraft(value))) {
        return sanitizeBoardDraft(parsed);
      }
    } catch {
      return { ...source, ...fallbackDraft() };
    }
  }

  const cleaned = {
    title: cleanText(source.title),
    summary: cleanText(source.summary),
    content: cleanText(source.content),
  };
  const lostRequiredValue = (
    (typeof source.title === "string" && source.title.trim() && !cleaned.title)
    || (typeof source.content === "string" && source.content.trim() && !cleaned.content)
  );
  if (lostRequiredValue) return { ...source, ...fallbackDraft() };
  return { ...source, ...cleaned };
}
