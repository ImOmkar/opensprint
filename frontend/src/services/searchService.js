import { api } from "../api/client"

export const searchService = {

    searchConcept: (concept) => 
        api.get(`/search?concept=${encodeURIComponent(concept)}`, {
            skipAuthRedirect: true 
        })
}