import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'taskdesk_token';

/**
 * Retrieve the stored JWT token from localStorage.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Persist a JWT token in localStorage.
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove the JWT token from localStorage.
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Decode a JWT token and return the payload.
 * Returns null if the token is invalid or expired.
 */
export function decodeToken(token) {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    if (decoded.exp && decoded.exp < now) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if the current stored token is valid (non-expired).
 */
export function isTokenValid() {
  const token = getToken();
  return !!decodeToken(token);
}
