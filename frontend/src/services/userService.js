import { api } from "../api/client"

export const userService = {

  getMe: (options = {}) => api.get("/auth/github/me", options),

  getMyStats: () => api.get("/users/me/stats"),

  updateCuriosity: (body) => api.patch(`/users/me/curiosity`, body),

  getPublicProfile: (username) =>
    api.get(`/users/${username}`, {
      skipAuthRedirect: true
  }),

  getPublicSprint: (username, sprintId) =>
    api.get(`/users/${username}/${sprintId}`, {
      skipAuthRedirect: true
  }),

  getPublicActivity: (username) =>
    api.get(`/users/${username}/activity`, {
      skipAuthRedirect: true
  }),
}


