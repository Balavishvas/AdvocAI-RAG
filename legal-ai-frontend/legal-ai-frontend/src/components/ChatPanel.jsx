import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble.jsx";

const SUGGESTIONS = [
  "What is the termination notice period?",
  "Are there any penalty clauses?",
  "Summarize the key obligations of each party.",
];

export default function ChatPanel({ activeSession, messages, onSend, isThinking }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setInput("");
  };

  if (!activeSession) {
    return (
      <main className="chat-panel chat-panel--empty">
        <div className="empty-state">
          <span className="empty-mark">§</span>
          <h2>No case file open</h2>
          <p>Upload a contract or agreement on the left to start asking questions about it.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-panel">
      <header className="chat-header">
        <div>
          <h2>{activeSession.filename}</h2>
          <p className="chat-header-meta">
            <span className="dot dot--live" /> {activeSession.chunks_created} clauses indexed ·
            session {activeSession.session_id.slice(0, 8)}
          </p>
        </div>
      </header>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="suggestions">
            <p>Try asking:</p>
            <div className="suggestion-chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" onClick={() => onSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} isError={m.isError} />
        ))}

        {isThinking && (
          <div className="message message--ai">
            <div className="bubble bubble--ai bubble--thinking">
              <span className="bubble-tab" aria-hidden="true" />
              <span className="thinking-dots">
                <span />
                <span />
                <span />
              </span>
              <span className="thinking-label">Reviewing the document</span>
            </div>
          </div>
        )}
      </div>

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask about a clause, term, or obligation…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isThinking}
        />
        <button type="submit" disabled={isThinking || !input.trim()}>
          Ask
        </button>
      </form>
    </main>
  );
}
