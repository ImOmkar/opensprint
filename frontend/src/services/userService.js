import { api } from "../api/client"

export const userService = {

  getMe: () => api.get("/auth/github/me"),
  
  getMyStats: () => api.get("/users/me/stats"),

  getPublicProfile: (username) =>
    api.get(`/users/${username}`),

  getPublicSprint: (username, sprintId) =>
    api.get(`/users/${username}/${sprintId}`),

}
