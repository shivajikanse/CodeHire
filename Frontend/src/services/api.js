const BASE_URL = "http://localhost:5000";

let accessToken = null;

/* ===== Token helpers ===== */
export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

/* ===== Core API Request ===== */
export async function apiRequest(
  endpoint,
  { method = "GET", body, auth = true } = {}
) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // 🔑 REQUIRED for refresh cookie
  });

  // 🔁 If access token expired → refresh
  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest(endpoint, { method, body, auth });
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API error");
  }

  return data;
}

/* ===== Refresh Access Token ===== */
async function refreshAccessToken() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return false;

    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    clearAccessToken();
    return false;
  }
}
