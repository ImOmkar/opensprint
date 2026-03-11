import { api } from "../api/client"

export const aiService = {
  async generateSummary(sprintId) {
    const res = await api.post(`/sprints/${sprintId}/generate-summary`)
    return res?.summary
  },

  async improve(text, field) {
    const res = await api.post("/ai/improve", {
        text,
        field
      })
    return res?.improved_text
  },

  async suggestTags(content){
    const res = await api.post("/ai/suggest-tags", {
        content
      })
    return res?.tags
  },

  expandConcept: (concept) => api.post("/ai/expand-concept", { concept }),

  suggestConcepts: (concept) =>
    api.post("/ai/suggest-concepts", { concept }),
}