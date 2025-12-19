"use client";

import { createContext, useEffect, useState } from "react";
import { apiRequest, setAccessToken, clearAccessToken } from "../services/api";
import * as authService from "../services/authservice.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore session on refresh
  useEffect(() => {
    async function restoreSession() {
      try {
        // Get new access token using refresh cookie
        const refresh = await fetch("http://localhost:5000/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!refresh.ok) throw new Error();

        const { accessToken } = await refresh.json();
        setAccessToken(accessToken);

        // Fetch current user
        const me = await apiRequest("/api/auth/me");
        setUser(me.user);
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    setUser(res.user);
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    setUser(res.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
