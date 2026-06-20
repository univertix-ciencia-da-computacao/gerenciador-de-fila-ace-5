const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? window.location.origin;

export function getWebSocketUrl() {
  const url = new URL(API_URL);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/api/v1/ws';
  url.search = '';
  url.hash = '';
  return url.toString();
}
