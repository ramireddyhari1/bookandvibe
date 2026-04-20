const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Production Smart Fallback
    if (hostname.includes("bookandvibe.in")) {
      return `https://api.bookandvibe.in/api`;
    }

    return `${protocol}//${hostname}:5000/api`;
  }
  return "http://127.0.0.1:5000/api";
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || getBaseUrl();

type FetchOptions = RequestInit & { requiresAuth?: boolean };

export async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requiresAuth = false, ...customConfig } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  if (requiresAuth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}
