"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { chatService } from "@/services/chatService";
import { buildChatHistory } from "@/services/chatHistory";
import { getApiErrorMessage } from "@/services/apiClient";

const SUGGESTIONS = [
  "Hawk-AI는 어떤 서비스인가요?",
  "현장 점검은 어떻게 하나요?",
  "최근 점검 결과를 알려주세요.",
  "팀원별 담당 역할을 알려주세요.",
  "AI 모델은 어떻게 구현했나요?",
];

const NAVIGATION_LABELS = {
  "/inspection": "현장점검 시작",
  "/histories": "점검이력 보기",
  "/analytics": "통계분석 보기",
  "/boards": "게시판 보기",
  "/boards/write": "게시글 작성하기",
  "/login": "로그인하기",
};

function responseActions(result) {
  if (Array.isArray(result.actions) && result.actions.length) return result.actions;
  const action = result.action;
  if (action?.type !== "NAVIGATE" || !NAVIGATION_LABELS[action.path]) return [];
  return [{ label: NAVIGATION_LABELS[action.path], href: action.path }];
}

export default function Chatbot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "BOT",
      text: "안녕하세요. Hawk-AI 서비스, 프로젝트와 실제 점검 이력을 안내해 드릴게요.",
      sources: [],
    },
  ]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (rawMessage = input) => {
    const message = rawMessage.trim();
    if (!message || loading) return;

    setShowSuggestions(false);
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "USER", text: message, sources: [] },
    ]);
    setInput("");
    setLoading(true);

    try {
      const history = buildChatHistory(messages, message);
      const result = await chatService.ask(message, history);
      setMessages((current) => [
        ...current,
        {
          id: `bot-${Date.now()}`,
          role: "BOT",
          text: result.answer,
          type: result.type,
          sources: result.sources || [],
          actions: responseActions(result),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "ERROR",
          text: getApiErrorMessage(error, "답변을 가져오지 못했습니다."),
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-root">
      {open && (
        <section className="chatbot-panel" role="dialog" aria-modal="false" aria-labelledby="chatbot-title">
          <header className="chatbot-header">
            <div>
              <strong id="chatbot-title">Hawk-AI 도우미</strong>
              <span>서비스와 실제 점검 이력을 안내합니다.</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="챗봇 닫기">×</button>
          </header>

          <div className="chatbot-messages" aria-live="polite">
            {messages.map((message) => (
              <div className={`chatbot-message ${message.role.toLowerCase()}`} key={message.id}>
                <span>{message.role === "USER" ? "나" : message.role === "ERROR" ? "오류" : "Hawk-AI"}</span>
                <p>{message.text}</p>
                {message.id === "welcome" && showSuggestions && (
                  <div className="chatbot-suggestions" aria-label="추천 질문">
                    <strong>추천 질문</strong>
                    <div>
                      {SUGGESTIONS.map((suggestion) => (
                        <button
                          type="button"
                          onClick={() => send(suggestion)}
                          disabled={loading}
                          key={suggestion}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {message.sources?.length > 0 && (
                  <ul className="chatbot-sources">
                    {message.sources.map((source) => (
                      <li key={source.id}>점검 #{source.id} · {source.location}</li>
                    ))}
                  </ul>
                )}
                {message.actions?.length > 0 && (
                  <div className="chatbot-actions">
                    {message.actions.slice(0, 2).map((action) => (
                      <button
                        type="button"
                        key={action.href}
                        onClick={() => {
                          router.push(action.href);
                          setOpen(false);
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chatbot-message loading">
                <span>Hawk-AI</span>
                <p><i /><i /><i /></p>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <div className="chatbot-input">
            <label htmlFor="chatbot-message">질문</label>
            <textarea
              id="chatbot-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder="질문을 입력하세요..."
              rows={2}
              disabled={loading}
            />
            <button type="button" onClick={() => send()} disabled={loading || !input.trim()} aria-label="질문 전송">
              전송
            </button>
          </div>
        </section>
      )}
      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "챗봇 닫기" : "챗봇 열기"}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.4-4.2A9 9 0 1 1 21 12Z" />
          <path d="M8 12h.01M12 12h.01M16 12h.01" />
        </svg>
      </button>
    </div>
  );
}
