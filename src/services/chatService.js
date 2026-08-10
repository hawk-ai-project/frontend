import { apiClient } from "./apiClient";


export const chatService = {
  ask: (message) =>
    apiClient.post("/chat", { message }, { timeout: 600000 }).then(({ data }) => data),
};
