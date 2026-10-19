// Volání serverových funkcí z prohlížeče. Vrací { data, error } jako dřív Supabase.
export async function apiRequest(path, { method = 'POST', body } = {}) {
  try {
    const res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) window.dispatchEvent(new Event('auth:expired'));
    if (!res.ok) return { data: null, error: { message: json.error || `Chyba serveru (${res.status})`, status: res.status } };
    return { data: 'data' in json ? json.data : json, error: null };
  } catch (e) {
    return { data: null, error: { message: 'Nepodařilo se spojit se serverem' } };
  }
}

export const dbRequest = (body) => apiRequest('/api/db', { body });
