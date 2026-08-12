const TOKEN_KEY = "hawk_ai_access_token";
let memoryToken = null;

function read(storage) {
  try { return storage?.getItem(TOKEN_KEY) || null; } catch { return null; }
}

export const tokenStorage = {
  get: () => {
    if (typeof window === "undefined") return null;
    return read(window.localStorage) || read(window.sessionStorage) || memoryToken;
  },
  set: (token) => {
    if (typeof window === "undefined") return;
    memoryToken = token;
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
      return;
    } catch {
      try { window.sessionStorage.setItem(TOKEN_KEY, token); } catch { /* memory fallback */ }
    }
  },
  remove: () => {
    memoryToken = null;
    if (typeof window === "undefined") return;
    try { window.localStorage.removeItem(TOKEN_KEY); } catch { /* unavailable */ }
    try { window.sessionStorage.removeItem(TOKEN_KEY); } catch { /* unavailable */ }
  },
};
