// Splits an AI answer on "[Page N]" style citations and wraps them
// in a tag that gets an animated brass highlight sweep — like a
// lawyer marking up the clause that supports the answer.
function renderWithCitations(text) {
  const parts = text.split(/(\[Page\s*\d+\]|\bPage\s*\d+\b)/gi);
  return parts.map((part, i) => {
    if (/^\[?Page\s*\d+\]?$/i.test(part)) {
      return (
        <span className="citation" key={i}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function MessageBubble({ role, content, isError }) {
  if (role === "user") {
    return (
      <div className="message message--user">
        <div className="bubble bubble--user">{content}</div>
      </div>
    );
  }

  return (
    <div className="message message--ai">
      <div className={`bubble bubble--ai ${isError ? "bubble--error" : ""}`}>
        <span className="bubble-tab" aria-hidden="true" />
        <p>{renderWithCitations(content)}</p>
      </div>
    </div>
  );
}
