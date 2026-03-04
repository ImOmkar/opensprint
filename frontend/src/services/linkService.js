import { api } from "../api/client"

export const linkService = {

  // resolveTitle: async (title) => {
  //   try {
  //     return await api.get(`/deep-dives/by-title/${encodeURIComponent(title)}`)
  //   } catch {
  //     return null
  //   }
  // }

  resolveTitle: async (title, mode, username) => {
    try {
      console.log("resolving:", title, username, mode)
      if (mode === "public") {
        return await api.get(
          `/deep-dives/public/by-title/${username}/${encodeURIComponent(title)}`
        )
      }
  
      return await api.get(
        `/deep-dives/by-title/${encodeURIComponent(title)}`
      )
    } catch {
      return null
    }
  }

}