const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('medicus_token');

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

function handleUnauthorized(res) {
  if (res.status === 401) {
    localStorage.removeItem('medicus_token')
    localStorage.removeItem('medicus_user')
    window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }
}

export async function validateSession() {
  const res = await fetch(`${API_BASE}/stats`, {
    headers: getAuthHeaders(),
  })

  handleUnauthorized(res)

  if (!res.ok) {
    throw new Error('Session validation failed')
  }

  return res.json()
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`, {
    headers: getAuthHeaders(),
  });

  handleUnauthorized(res)

  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  handleUnauthorized(res)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${API_BASE}/documents/`, {
    headers: getAuthHeaders(),
  });

  handleUnauthorized(res)

  if (!res.ok) throw new Error('Failed to list documents');
  return res.json();
}

export async function deleteDocument(docId) {
  const res = await fetch(`${API_BASE}/documents/${docId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  handleUnauthorized(res)

  if (!res.ok) throw new Error('Failed to delete document');
  return res.json();
}

export async function sendMessage(question, conversationId = null) {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      question,
      conversation_id: conversationId,
    }),
  });

  handleUnauthorized(res)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Chat request failed' }));
    throw new Error(err.detail || 'Chat request failed');
  }
  return res.json();
}

export async function registerUser(fullName, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }

  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Login failed');
  }

  return res.json();
}
