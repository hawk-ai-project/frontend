"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { tokenStorage } from "@/utils/tokenStorage";
import { ROUTES } from "@/constants/routes";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    tokenStorage.remove();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    Promise.resolve().then(async () => {
      const storedToken = tokenStorage.get();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      setToken(storedToken);
      try {
        setUser(await authService.me());
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    });
  }, [clearAuth]);

  useEffect(() => {
    const unauthorized = () => {
      clearAuth();
      router.replace(ROUTES.login);
    };
    window.addEventListener("hawk-ai:unauthorized", unauthorized);
    return () =>
      window.removeEventListener("hawk-ai:unauthorized", unauthorized);
  }, [clearAuth, router]);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    tokenStorage.set(result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
    return result;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      /* Local logout must still complete. */
    }
    clearAuth();
    router.push(ROUTES.home);
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
