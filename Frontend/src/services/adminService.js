import { apiRequest } from './api';

export async function getAdminDashboard() {
  const res = await apiRequest('/api/admin/dashboard');
  return res.data;
}

export async function getUsers() {
  const res = await apiRequest('/api/admin/users');
  return res.data;
}

export async function getUser(id) {
  const res = await apiRequest(`/api/admin/users/${id}`);
  return res.data;
}

export async function updateUserRole(id, role) {
  const res = await apiRequest(`/api/admin/users/${id}/role`, { method: 'PATCH', body: { role } });
  return res.data;
}

export async function deleteUser(id) {
  const res = await apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' });
  return res.data;
}

export async function getAllBookings(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiRequest(`/api/admin/bookings${query ? `?${query}` : ''}`);
  return res.data;
}

export async function getAllSessions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiRequest(`/api/admin/sessions${query ? `?${query}` : ''}`);
  return res.data;
}

export async function getRevenue() {
  const res = await apiRequest('/api/admin/revenue');
  return res.data;
}

export async function createSlot(payload) {
  const res = await apiRequest('/api/admin/slots', { method: 'POST', body: payload });
  return res.data;
}

export async function updateSlot(id, payload) {
  const res = await apiRequest(`/api/admin/slots/${id}`, { method: 'PATCH', body: payload });
  return res.data;
}

export async function deleteSlot(id) {
  const res = await apiRequest(`/api/admin/slots/${id}`, { method: 'DELETE' });
  return res.data;
}

export async function getIotStatus() {
  const res = await apiRequest('/api/admin/iot/status');
  return res.data;
}

/** Raw (unmapped) slot records for admin management — no visual "occupied" overlay applied. */
export async function getRawSlots() {
  const res = await apiRequest('/api/parking/slots');
  return res.data;
}
