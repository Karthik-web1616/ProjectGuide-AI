const API_BASE = 'http://127.0.0.1:8000';

async function postJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status}: ${errText}`);
  }
  return res.json();
}

export function submitOnboarding(payload) {
  return postJSON('/onboarding', payload);
}

export function submitIdeaToBackend(payload) {
  return postJSON('/submit-idea', payload);
}

export async function fetchFeasibilityReport(payload) {
  return postJSON('/api/feasibility-check', payload);
}