// -----------------------------------------------------------------------
// Thin fetch wrapper for talking to the Smart Parking backend.
// Base URL comes from Vite env (VITE_API_URL), defaulting to the local
// dev backend. Automatically attaches the JWT (if present) and throws a
// normalized error so callers can just try/catch.
// -----------------------------------------------------------------------

const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? 'https://smartparking-p41s.onrender.com' : '');
const TOKEN_KEY = 'smartpark_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // no body / non-JSON response
  }

  if (!res.ok) {
    // Session expired/invalid: clear the stale token and bounce to
    // /login. Only do this when we actually sent a token — a 401 on an
    // unauthenticated request just means "please log in", not "your
    // session died", so there's nothing to clear.
    if (res.status === 401 && auth && token) {
      setToken(null);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message = payload?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return payload;
}

export { API_URL };
