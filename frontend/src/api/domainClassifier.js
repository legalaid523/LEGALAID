const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Classify user text into a legal domain via backend POST /classify
 * @returns {{ domain: string, confidence: number }}
 */
export async function classifyDomain(text, top_k = 3) {
  const response = await fetch(`${API_BASE_URL}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, top_k }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Domain classification failed');
  }

  const predictions = await response.json();
  return predictions;
}
