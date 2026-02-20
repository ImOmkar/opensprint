import { api } from "../api/client"

export const authService = {

  logout: async () => {
    await api.post("/auth/github/logout")
  }

}