"use client";

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { tokenStorage } from "@/utils/tokenStorage";
import { ROUTES } from "@/constants/routes";
import { isSessionExpiredError } from "@/services/apiClient";

export const AuthContext = createContext(null);

const INITIAL_AUTH_STATE = {
  status: "checking",
  token: null,
  user: null,
};

const REFRESH_EARLY_MS = 60 * 1000;
const SESSION_HEARTBEAT_MS = 5 * 60 * 1000;

function getTokenExpiry(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
    return Number(decoded.exp) * 1000;
  } catch {
    return 0;
  }
}

// Root layout이 다시 마운트되더라도 확인된 인증 상태를 재사용해
// 헤더가 잠시 비회원 메뉴로 돌아가는 현상을 막는다.
let cachedAuthState = INITIAL_AUTH_STATE;

export function AuthProvider({ children }) {
  const router = useRouter();
  const [authState, setAuthState] = useState(() => cachedAuthState);
  const authStateRef = useRef(authState);

  const updateAuthState = useCallback((nextState) => {
    cachedAuthState = nextState;
    authStateRef.current = nextState;
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
        try {
          const refreshed = await authService.refresh();
          if (!cancelled) updateAuthState({ status: "authenticated", token: refreshed.accessToken, user: refreshed.user });
        } catch {
          if (!cancelled) clearAuth();
        }
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
    const tokenRefreshed = (event) => {
      const result = event.detail;
      updateAuthState({ status: "authenticated", token: result.accessToken, user: result.user });
    };
    window.addEventListener("hawk-ai:token-refreshed", tokenRefreshed);
    return () => window.removeEventListener("hawk-ai:token-refreshed", tokenRefreshed);
  }, [updateAuthState]);

  useEffect(() => {
    const sessionExpired = () => {
      clearAuth();
      router.replace(ROUTES.login);
    };
    window.addEventListener("hawk-ai:session-expired", sessionExpired);
    return () =>
      window.removeEventListener("hawk-ai:session-expired", sessionExpired);
  }, [clearAuth, router]);

  useEffect(() => {
    if (authState.status !== "authenticated" || !authState.token) return undefined;

    let cancelled = false;
    const expiresAt = getTokenExpiry(authState.token);
    const delay = Math.max(0, expiresAt - Date.now() - REFRESH_EARLY_MS);
    const timer = window.setTimeout(async () => {
      try {
        await authService.refresh();
      } catch (error) {
        if (!cancelled && isSessionExpiredError(error)) {
          clearAuth();
          router.replace(ROUTES.login);
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [authState.status, authState.token, clearAuth, router]);

  useEffect(() => {
    let cancelled = false;
    const keepAlive = async () => {
      if (cancelled || authStateRef.current.status !== "authenticated") return;
      try {
        await authService.refresh();
      } catch (error) {
        if (!cancelled && isSessionExpiredError(error)) {
          clearAuth();
          router.replace(ROUTES.login);
        }
      }
    };
    const onVisible = () => { if (document.visibilityState === "visible") void keepAlive(); };
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void keepAlive(); }, SESSION_HEARTBEAT_MS);
    window.addEventListener("focus", keepAlive);
    window.addEventListener("online", keepAlive);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", keepAlive);
      window.removeEventListener("online", keepAlive);
      document.removeEventListener("visibilitychange", onVisible);
    };
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

  const updateProfile = async (payload) => {
    const updatedUser = await authService.updateProfile(payload);
    updateAuthState({ ...authState, user: updatedUser });
    return updatedUser;
  };

  const updateProfileImage = async (file) => {
    const updatedUser = await authService.updateProfileImage(file);
    updateAuthState({ ...authState, user: updatedUser });
    return updatedUser;
  };

  const deleteProfileImage = async () => {
    const updatedUser = await authService.deleteProfileImage();
    updateAuthState({ ...authState, user: updatedUser });
    return updatedUser;
  };

  const value = {
    token: authState.token,
    user: authState.user,
    isAuthenticated: authState.status === "authenticated",
    isLoading: authState.status === "checking",
    login,
    logout,
    updateProfile,
    updateProfileImage,
    deleteProfileImage,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
