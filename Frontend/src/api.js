export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
