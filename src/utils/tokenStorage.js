const TOKEN_KEY = "hawk_ai_access_token";

export const tokenStorage = {
  get: () =>
    typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY),
  set: (token) => {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  },
  remove: () => {
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  },
};
