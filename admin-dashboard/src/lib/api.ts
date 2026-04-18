const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000/api`;
  }
  return "http://127.0.0.1:5000/api";
};

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || getBaseUrl();

type FetchOptions = RequestInit & { requiresAuth?: boolean };

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { requiresAuth = true, ...customConfig } = options;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  if (requiresAuth) {
    const token = typeof window !== "undefined"
      ? sessionStorage.getItem("admin_dash_token") || localStorage.getItem("admin_dash_token")
      : null;
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  // Ensure absolute URL if endpoint doesn't start with http
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, config);
  
  // Handle empty responses
  let data = {};
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error((data as any).error || (data as any).message || "Something went wrong");
  }

  return data;
}
