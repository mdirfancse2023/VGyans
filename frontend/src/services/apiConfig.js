export const BASE_API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://v-gyans.vercel.app');

export async function fetchJson(endpoint, options = {}) {
  const url = `${BASE_API_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call error to ${endpoint}:`, err);
    throw err;
  }
}
