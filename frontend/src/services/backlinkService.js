import { api } from "../api/client"

export const backlinkService = {

  get: (diveId) =>
    api.get(`/deep-dives/${diveId}/backlinks`)

}