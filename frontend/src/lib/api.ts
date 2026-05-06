// src/lib/api.ts  — axios replaced with fetch wrapper (no external dependency needed)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
  const url = `${API_URL}${path}`;
  if (!params) return url;
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return `${url}?${qs}`;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
    throw new Error('Não autorizado');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

const api = {
  async get<T = unknown>(path: string, config?: ApiConfig): Promise<T> {
    const res = await fetch(buildUrl(path, config?.params), {
      headers: { ...authHeaders(), ...(config?.headers ?? {}) },
    });
    return handleResponse<T>(res);
  },

  async post<T = unknown>(path: string, data?: unknown, config?: ApiConfig): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(config?.headers ?? {}),
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(res);
  },

  async put<T = unknown>(path: string, data?: unknown, config?: ApiConfig): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(config?.headers ?? {}),
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(res);
  },

  async patch<T = unknown>(path: string, data?: unknown, config?: ApiConfig): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(config?.headers ?? {}),
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(res);
  },

  async delete<T = unknown>(path: string, config?: ApiConfig): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'DELETE',
      headers: { ...authHeaders(), ...(config?.headers ?? {}) },
    });
    return handleResponse<T>(res);
  },
};

export default api;
