import { api } from "../api/client"

export const notificationService = {

  async get() {
    const res = await api.get("/notifications")
    return res.data
  },

  async markAsRead(id) {
    await api.post(`/notifications/${id}/read`)
  }

}