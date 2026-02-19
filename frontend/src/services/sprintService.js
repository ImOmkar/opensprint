import { api } from "../api/client"

export const sprintService = {

  getMine: () => api.get("/sprints/mine"),

  create: (body) => api.post("/sprints", body),

  update: (id, body) => api.put(`/sprints/${id}`, body),

  delete: (id) => api.delete(`/sprints/${id}`),

  toggle: (id) => api.patch(`/sprints/${id}/toggle`)
}
