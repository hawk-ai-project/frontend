import { apiClient } from "./apiClient";


export const analyticsInsightService = {
  analyze: (payload) =>
    apiClient
      .post("/analytics/insights", payload)
      .then(({ data }) => data),
};
