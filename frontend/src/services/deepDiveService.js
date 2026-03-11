import { api } from "../api/client"

export const deepDiveService = {

  getBySprint: (sprintId) =>
    api.get(`/deep-dives/sprint/${sprintId}`),

  getConceptRadar: (sprintId) =>
    api.get(`/deep-dives/sprint/${sprintId}/concept-radar`),

  getSprintTimeline: (sprintId) =>
    api.get(`/deep-dives/sprint/${sprintId}/timeline`),

  getById: (id) =>
    api.get(`/deep-dives/${id}`),

  getPublicDive: (id) =>
    api.get(`/deep-dives/public/${id}`, {
      skipAuthRedirect: true
  }),

  create: (body) =>
    api.post("/deep-dives", body),

  update: (id, body) =>
    api.put(`/deep-dives/${id}`, body),

  delete: (id) =>
    api.delete(`/deep-dives/${id}`),

  getBacklinks: (id) =>
    api.get(`/deep-dives/${id}/backlinks`),

  getRelated: (diveId) =>
    api.get(`/deep-dives/${diveId}/related`),
  
  getActivityFeed: () =>
    api.get("/deep-dives/feed"),
}