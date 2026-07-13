const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Uploads a PDF to the backend. Returns { session_id, filename, chunks_created, message }.
 * Throws an Error with a readable message if the upload fails.
 */
export async function uploadDocument(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail || `Upload failed with status ${response.status}`;
    throw new Error(detail);
  }

  return data;
}

/**
 * Asks a question about a previously uploaded document.
 * Returns { session_id, question, answer }.
 */
export async function askQuestion(sessionId, question) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, question }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail || `Request failed with status ${response.status}`;
    throw new Error(detail);
  }

  return data;
}

/**
 * Checks the backend is reachable at all (used to show a connection-status indicator).
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/`);
    return response.ok;
  } catch {
    return false;
  }
}
