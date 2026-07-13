import { useRef, useState } from "react";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onUpload,
  uploadState, // "idle" | "uploading" | "indexing" | "error"
  uploadError,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      onUpload(null, "Only PDF files are supported.");
      return;
    }
    onUpload(file);
  };

  const busy = uploadState === "uploading" || uploadState === "indexing";

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">§</span>
        <div>
          <h1>Advoc AI Rag</h1>
          <p className="brand-sub">Legal document assistant</p>
        </div>
      </div>

      <div
        className={`dropzone ${isDragging ? "dropzone--active" : ""} ${busy ? "dropzone--busy" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => !busy && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="dropzone-tab" aria-hidden="true" />
        {busy ? (
          <>
            <div className="spinner" />
            <p className="dropzone-title">
              {uploadState === "uploading" ? "Uploading document…" : "Indexing clauses…"}
            </p>
            <p className="dropzone-hint">This takes a few seconds</p>
          </>
        ) : (
          <>
            <p className="dropzone-title">Open a new case file</p>
            <p className="dropzone-hint">Drop a contract PDF here, or click to browse</p>
          </>
        )}
      </div>

      {uploadState === "error" && uploadError && (
        <div className="upload-error">{uploadError}</div>
      )}

      <div className="session-list">
        <p className="section-label">Case files</p>
        {sessions.length === 0 && (
          <p className="empty-hint">Uploaded documents will appear here.</p>
        )}
        {sessions.map((s) => (
          <button
            key={s.session_id}
            className={`session-card ${s.session_id === activeSessionId ? "session-card--active" : ""}`}
            onClick={() => onSelectSession(s.session_id)}
          >
            <span className="session-icon" aria-hidden="true">
              ⎘
            </span>
            <span className="session-info">
              <span className="session-name" title={s.filename}>
                {s.filename}
              </span>
              <span className="session-meta">
                {s.chunks_created} clauses indexed
                {s.size ? ` · ${formatBytes(s.size)}` : ""}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <p>Not legal advice. For guidance only.</p>
      </div>
    </aside>
  );
}
