import { api } from "../api/client"

export const activityService = {
    get: () => api.get("/deep-dives/activity")
}