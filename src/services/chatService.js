import { apiClient } from "./apiClient";


export const chatService = {
  ask: (message, history = []) =>
    apiClient.post("/chat", { message, history }, { timeout: 600000 }).then(({ data }) => data),
};
