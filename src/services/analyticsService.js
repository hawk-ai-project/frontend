import { apiClient } from "./apiClient";

export const analyticsService = {
  getSummary: (params) =>
    apiClient.get("/analytics/summary", { params }).then(({ data }) => data),

  getRegions: () =>
    apiClient.get("/analytics/regions").then(({ data }) => data),
};