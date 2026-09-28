// All requests to the Laravel API. Public functions (menu, orders, reservations)
// need no auth. Admin functions send the signed-in user's Sanctum token via
// authHeaders() from auth.js, and hit routes under /admin which your
// routes/api.php protects with auth:sanctum + the role middleware.

import { authHeaders } from './auth';

const API = (import.meta.env?.VITE_API_URL || 'http://localhost:8000/api') + '/v1';

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || (body.errors && Object.values(body.errors)[0]?.[0]) || message;
    } catch { /* response wasn't JSON */ }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

/* ---------- PUBLIC ---------- */

export async function fetchMenu() {
  const res = await fetch(`${API}/menu`, { headers: { Accept: 'application/json' } });
  return handle(res);
}

export async function createOrder(payload) {
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function createReservation(payload) {
  const res = await fetch(`${API}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

/* ---------- ADMIN (requires a signed-in session) ---------- */

export async function fetchAdminOrders(page = 1) {
  const res = await fetch(`${API}/admin/orders?page=${page}`, {
    headers: { ...authHeaders(), Accept: 'application/json' },
  });
  return handle(res);
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handle(res);
}

export async function fetchAdminReservations(page = 1) {
  const res = await fetch(`${API}/admin/reservations?page=${page}`, {
    headers: { ...authHeaders(), Accept: 'application/json' },
  });
  return handle(res);
}

export async function updateReservationStatus(reservationId, status) {
  const res = await fetch(`${API}/admin/reservations/${reservationId}/status`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handle(res);
}

export async function createMenuItem(payload) {
  const res = await fetch(`${API}/admin/menu-items`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function updateMenuItem(id, payload) {
  const res = await fetch(`${API}/admin/menu-items/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deleteMenuItem(id) {
  const res = await fetch(`${API}/admin/menu-items/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders(), Accept: 'application/json' },
  });
  return handle(res);
}

export async function fetchTipsReport() {
  const res = await fetch(`${API}/admin/tips/report`, {
    headers: { ...authHeaders(), Accept: 'application/json' },
  });
  return handle(res);
}