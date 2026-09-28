// Admin authentication + authorisation helper.
// Talks to the Laravel API (Sanctum token auth) under the /v1 prefix your
// routes/api.php uses.

const API = (import.meta.env?.VITE_API_URL || 'http://localhost:8000/api') + '/v1';
const KEY = 'wsk-session';

// Role → which admin tabs that role may open. Mirrors the role:... middleware
// groups in routes/api.php — this is a convenience for the UI only; the
// server is what actually enforces it.
export const PERMISSIONS = {
  manager: ['Overview', 'Orders', 'Menu & stock', 'Reservations', 'Customers', 'Reports'],
  supervisor: ['Overview', 'Orders', 'Menu & stock', 'Reservations'],
  staff: ['Overview', 'Orders'],
};

export const can = (user, tab) =>
  !!user && (PERMISSIONS[user.role] || []).includes(tab);

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* ignore */ }
  return session;
}

export async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password, device_name: 'admin-panel' }),
  });

  if (res.status === 401 || res.status === 422) {
    throw new Error('Those details do not match our records.');
  }
  if (!res.ok) {
    throw new Error('Could not reach the server. Please try again.');
  }

  const data = await res.json();
  if (!data?.user?.role) throw new Error('This account has no admin role assigned.');

  return saveSession({ token: data.token, user: data.user });
}

export async function logout() {
  const session = loadSession();
  try {
    if (session) {
      await fetch(`${API}/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}`, Accept: 'application/json' },
      });
    }
  } catch { /* ignore — we clear the local session either way */ }
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

// Use for any authenticated admin request.
export function authHeaders() {
  const s = loadSession();
  return s ? { Authorization: `Bearer ${s.token}` } : {};
}