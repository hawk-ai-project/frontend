"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { tokenStorage } from "@/utils/tokenStorage";
import { ROUTES } from "@/constants/routes";

export const AuthContext = createContext(null);

const INITIAL_AUTH_STATE = {
  status: "checking",
  token: null,
  user: null,
};

// Root layout이 다시 마운트되더라도 확인된 인증 상태를 재사용해
// 헤더가 잠시 비회원 메뉴로 돌아가는 현상을 막는다.
let cachedAuthState = INITIAL_AUTH_STATE;

export function AuthProvider({ children }) {
  const router = useRouter();
  const [authState, setAuthState] = useState(() => cachedAuthState);

  const updateAuthState = useCallback((nextState) => {
    cachedAuthState = nextState;
    setAuthState(nextState);
  }, []);

  const clearAuth = useCallback(() => {
    tokenStorage.remove();
    updateAuthState({ status: "guest", token: null, user: null });
  }, [updateAuthState]);

  useEffect(() => {
    let cancelled = false;

    async function initializeAuth() {
      if (cachedAuthState.status !== "checking") return;

      const storedToken = tokenStorage.get();
      if (!storedToken) {
        if (!cancelled) clearAuth();
        return;
      }

      try {
        const currentUser = await authService.me();
        if (!cancelled) {
          updateAuthState({
            status: "authenticated",
            token: storedToken,
            user: currentUser,
          });
        }
      } catch {
        if (!cancelled) clearAuth();
      }
    }

    initializeAuth();
    return () => {
      cancelled = true;
    };
  }, [clearAuth, updateAuthState]);

  useEffect(() => {
    const sessionExpired = () => {
      clearAuth();
      router.replace(ROUTES.login);
    };
    window.addEventListener("hawk-ai:session-expired", sessionExpired);
    return () =>
      window.removeEventListener("hawk-ai:session-expired", sessionExpired);
  }, [clearAuth, router]);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    tokenStorage.set(result.accessToken);
    updateAuthState({
      status: "authenticated",
      token: result.accessToken,
      user: result.user,
    });
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
    token: authState.token,
    user: authState.user,
    isAuthenticated: authState.status === "authenticated",
    isLoading: authState.status === "checking",
    login,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
