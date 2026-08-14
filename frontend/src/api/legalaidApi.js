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

/**
 * Generate and download a PDF legal notice from matched case data.
 * @param {Object} matchResult - The full match result from the chat API
 * @returns {Promise<void>} Triggers a browser file download
 */
export async function generatePdf(matchResult) {
  const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain_id: matchResult.domain_id || '',
      matched_sections: matchResult.matched_sections || [],
      extracted_facts: matchResult.extracted_facts || {},
      applicable_laws: matchResult.applicable_laws || [],
      confidence_flags: matchResult.confidence_flags || [],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to generate PDF');
  }

  // Get the PDF blob and trigger download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // Extract filename from Content-Disposition header or use a default
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'LegalAId_case_summary.pdf';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+?)"?$/);
    if (match) filename = match[1];
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

