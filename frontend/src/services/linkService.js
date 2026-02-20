import { api } from "../api/client"

export const linkService = {

  resolveTitle: (title) =>
    api.get(`/deep-dives/by-title/${encodeURIComponent(title)}`)

}