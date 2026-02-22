import { api } from "../api/client"

export const draftService = {

  save: (data) =>
    api.post("/drafts/", data),

  load: (sprintId) =>
    api.get(`/drafts/${sprintId}`),

  delete: (sprintId) =>
    api.delete(`/drafts/${sprintId}`)
}