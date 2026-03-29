// Base URL for all API calls.
// In production (Vercel), VITE_API_URL must be set to your Render backend URL,
// e.g. https://openpaws-backend.onrender.com
// In development, falls back to empty string so Vite proxy handles /api/* → localhost:3001
export const API_BASE = import.meta.env.VITE_API_URL || "";

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}
