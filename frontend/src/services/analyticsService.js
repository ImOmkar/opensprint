import { api } from "../api/client"

export const analyticsService = {

  trackEvent: (body) =>
    api.post("/analytics/event", body),

  getDiveAnalytics: (diveId) =>
    api.get(`/analytics/dive/${diveId}`),

  getSprintAnalytics: (sprintId) =>
    api.get(`/analytics/sprint/${sprintId}`)
}
