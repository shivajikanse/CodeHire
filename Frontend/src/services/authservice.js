import { apiRequest, setAccessToken, clearAccessToken } from "./api";

/* REGISTER */
export async function register({ name, email, password }) {
  const data = await apiRequest("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
    auth: false,
  });

  setAccessToken(data.accessToken);
  return data; // return user to caller
}

/* LOGIN */
export async function login({ email, password }) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });

  setAccessToken(data.accessToken);
  return data;
}

/* LOGOUT */
export async function logout() {
  await apiRequest("/api/auth/logout", { method: "POST" });
  clearAccessToken();
}
