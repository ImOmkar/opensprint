import { api } from "../api/client"

export const versionService = {

  getVersions: (diveId) =>
    api.get(`/deep-dives/${diveId}/versions`),

  restore: (diveId, versionId) =>
    api.post(`/deep-dives/${diveId}/restore/${versionId}`)

}