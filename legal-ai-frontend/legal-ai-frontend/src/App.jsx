import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import { uploadDocument, askQuestion, checkHealth } from "./api.js";

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  // messagesBySession: { [session_id]: [{ role, content, isError }] }
  const [messagesBySession, setMessagesBySession] = useState({});
  const [isThinking, setIsThinking] = useState(false);

  const [uploadState, setUploadState] = useState("idle"); // idle | uploading | indexing | error
  const [uploadError, setUploadError] = useState("");
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, []);

  const activeSession = sessions.find((s) => s.session_id === activeSessionId) || null;
  const activeMessages = activeSessionId ? messagesBySession[activeSessionId] || [] : [];

  async function handleUpload(file, validationError) {
    if (validationError) {
      setUploadState("error");
      setUploadError(validationError);
      return;
    }

    setUploadState("uploading");
    setUploadError("");

    try {
      // brief pause so "uploading" state is visible even on fast local networks
      const result = await uploadDocument(file);
      setUploadState("indexing");

      const newSession = {
        session_id: result.session_id,
        filename: result.filename,
        chunks_created: result.chunks_created,
        size: file.size,
      };

      setSessions((prev) => [newSession, ...prev]);
      setMessagesBySession((prev) => ({ ...prev, [newSession.session_id]: [] }));
      setActiveSessionId(newSession.session_id);
      setUploadState("idle");
    } catch (err) {
      setUploadState("error");
      setUploadError(err.message || "Something went wrong during upload.");
    }
  }

  async function handleSend(question) {
    if (!activeSessionId) return;

    setMessagesBySession((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), { role: "user", content: question }],
    }));
    setIsThinking(true);

    try {
      const result = await askQuestion(activeSessionId, question);
      setMessagesBySession((prev) => ({
        ...prev,
        [activeSessionId]: [...(prev[activeSessionId] || []), { role: "ai", content: result.answer }],
      }));
    } catch (err) {
      setMessagesBySession((prev) => ({
        ...prev,
        [activeSessionId]: [
          ...(prev[activeSessionId] || []),
          { role: "ai", content: err.message || "Failed to get an answer.", isError: true },
        ],
      }));
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onUpload={handleUpload}
        uploadState={uploadState}
        uploadError={uploadError}
      />
      <ChatPanel
        activeSession={activeSession}
        messages={activeMessages}
        onSend={handleSend}
        isThinking={isThinking}
      />

      {backendOnline === false && (
        <div className="backend-offline-banner">
          Can't reach the backend at 127.0.0.1:8000 — make sure{" "}
          <code>uvicorn app.main:app --reload</code> is running.
        </div>
      )}
    </div>
  );
}
