import { getStoredAuth } from "./utils/auth";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem("token") || localStorage.getItem("admin_token") || getStoredAuth()?.token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(endpoint, { method: "GET", headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const token = localStorage.getItem("token") || localStorage.getItem("admin_token") || getStoredAuth()?.token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(endpoint, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const token = localStorage.getItem("token") || localStorage.getItem("admin_token") || getStoredAuth()?.token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}