import { api } from "../api/client"

export const backlinkService = {

  get: (diveId) =>
    api.get(`/deep-dives/${diveId}/backlinks`),

  getPublicBacklinks: (id) =>
    api.get(`/deep-dives/public/${id}/backlinks`, {
      skipAuthRedirect: true
    })

}