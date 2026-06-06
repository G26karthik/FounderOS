const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`API request failed: ${endpoint}`, err);
    throw err;
  }
}

// ── Query ────────────────────────────────────
export async function queryMemory(question) {
  return request('/query', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

// ── Timeline ─────────────────────────────────
export async function getTimeline(type = 'all', limit = 50, offset = 0) {
  return request(`/timeline?type=${type}&limit=${limit}&offset=${offset}`);
}

// ── Digest ───────────────────────────────────
export async function generateDigest(days = 7) {
  return request(`/digest?days=${days}`, { method: 'POST' });
}

// ── Privacy / Collections ────────────────────
export async function getCollections() {
  return request('/collections');
}

export async function clearCollection(name) {
  return request(`/collections/${name}`, { method: 'DELETE' });
}

export async function deleteEntry(collection, id) {
  return request(`/entries/${collection}/${id}`, { method: 'DELETE' });
}

export async function updateEntry(collection, id, payload) {
  return request(`/entries/${collection}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// ── Health ───────────────────────────────────
export async function healthCheck() {
  return request('/health');
}

// ── Webhook test (for demo) ──────────────────
export async function sendTestTranscript(text) {
  return request('/omi/webhook', {
    method: 'POST',
    body: JSON.stringify({
      id: `demo_${Date.now()}`,
      created_at: new Date().toISOString(),
      transcript_segments: [
        { text, speaker: 'SPEAKER_00', is_user: true, start: 0, end: text.length / 10 },
      ],
      source: 'demo',
    }),
  });
}
