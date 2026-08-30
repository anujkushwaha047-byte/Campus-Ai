import { StudentProfile } from "../types";

const AUTH_STORAGE_KEY = "campuscare_auth_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AuthSession {
  token: string;
  student: StudentProfile;
  timestamp: number;
}

/**
 * Retrieve the active authentication session from localStorage.
 * Checks for validity and expiration. Returns null if missing or expired.
 */
export function getStoredAuth(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const session: AuthSession = JSON.parse(raw);
    if (!session || !session.token || !session.student || !session.student.rollNumber) {
      clearStoredAuth();
      return null;
    }

    // Check if session has expired
    const isExpired = Date.now() - session.timestamp > SESSION_TTL_MS;
    if (isExpired) {
      clearStoredAuth();
      return null;
    }

    return session;
  } catch (err) {
    console.error("Failed to parse stored auth session:", err);
    clearStoredAuth();
    return null;
  }
}

/**
 * Persist an authenticated session in localStorage.
 */
export function saveStoredAuth(token: string, student: StudentProfile): void {
  try {
    const session: AuthSession = {
      token,
      student,
      timestamp: Date.now(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error("Failed to save auth session:", err);
  }
}

/**
 * Clear stored auth session (logout / session expiry).
 */
export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("student");
    localStorage.removeItem("studentProfile");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("isUserAuth");
  } catch (err) {
    console.error("Failed to clear auth session:", err);
  }
}

/**
 * Check if the user is currently authenticated with a valid session.
 */
export function isAuthenticated(): boolean {
  return getStoredAuth() !== null;
}

/**
 * Helper to construct standard authorization headers for API calls.
 */
export function getAuthHeaders(userRole?: "admin" | "student"): Record<string, string> {
  const session = getStoredAuth();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }
  if (userRole) {
    headers["x-user-role"] = userRole;
  }
  return headers;
}
