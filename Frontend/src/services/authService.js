import { apiRequest, setToken } from './api';

export async function registerUser(payload) {
  const res = await apiRequest('/api/auth/register', { method: 'POST', body: payload, auth: false });
  setToken(res.data.token);
  return res.data.user;
}

export async function loginUser({ email, password }) {
  const res = await apiRequest('/api/auth/login', { method: 'POST', body: { email, password }, auth: false });
  setToken(res.data.token);
  return res.data.user;
}

export async function fetchCurrentUser() {
  const res = await apiRequest('/api/auth/me');
  return res.data.user;
}

export function logoutUser() {
  setToken(null);
}
