import { Platform } from 'react-native';
import { getSecureData, StorageKeys } from "./storage";

// Android Emulator must use 10.0.2.2. All other platforms use 127.0.0.1 (standardized host).
const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://127.0.0.1:5000/api';

type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function apiRequest<T>(path: string, method: ApiMethod, body?: unknown): Promise<T> {
  const token = await getSecureData(StorageKeys.AUTH_TOKEN);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.error || payload?.message || 'Request failed');
    }

    // Backend returns { data: T } or just T. Standardize here.
    return payload?.data !== undefined ? payload.data : payload;
  } catch (error) {
    console.error(`API Request Error [${method} ${path}]:`, error);
    throw error;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, 'GET');
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, 'POST', body);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, 'PATCH', body);
}

export async function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, 'DELETE');
}

export { API_BASE };
