import { api } from "../api/client"

export const timelineService = {
  async get() {
    const res = await api.get("/timeline")
    return res
  },
  
  async getPublic(username) {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/${username}/timeline`
    )

    if (!res.ok) throw new Error()

    return res.json()
  }
}