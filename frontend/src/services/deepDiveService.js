import { api } from "../api/client"

export const deepDiveService = {

  getBySprint: (sprintId) =>
    api.get(`/deep-dives/sprint/${sprintId}`),

  create: (body) =>
    api.post("/deep-dives", body),

  update: (id, body) =>
    api.put(`/deep-dives/${id}`, body),

  delete: (id) =>
    api.delete(`/deep-dives/${id}`)
}
