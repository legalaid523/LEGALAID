const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

/**
 * Start a new conversation session.
 * @returns {Promise<{ session_id: string }>}
 */
export async function startSession() {
  const response = await fetch(`${API_BASE_URL}/api/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to start session');
  }

  return response.json();
}

/**
 * Send a message in an existing conversation session.
 * @param {string} sessionId
 * @param {string} message
 * @param {string} language - 'en' or 'hi'
 * @returns {Promise<Object>} The full pipeline response
 */
export async function sendMessage(sessionId, message, language = 'en') {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      language,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to send message');
  }

  return response.json();
}
