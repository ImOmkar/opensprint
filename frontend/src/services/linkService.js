import { api } from "../api/client"

export const linkService = {
  resolveTitle: async (title, mode, username) => {
    try {
      console.log("resolving:", title, username, mode)

      if (mode === "public") {
        return await api.get(
          `/deep-dives/public/by-title/${username}/${encodeURIComponent(title)}`,
          { skipAuthRedirect: true }
        )
      }

      return await api.get(`/deep-dives/by-title/${encodeURIComponent(title)}`)
    } catch {
      return null
    }
  }
}
