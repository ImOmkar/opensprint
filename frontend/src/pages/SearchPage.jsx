import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { searchService } from "../services/searchService"
import PublicLayout from "../components/PublicLayout"

function SearchPage() {

  const [params] = useSearchParams()
  const concept = params.get("concept")

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    if (!concept) return

    searchService.searchConcept(concept)
      .then(data => {
        setResults(data.results)
        setLoading(false)
      })
      .catch(() => setLoading(false))

  }, [concept])


  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (

    <PublicLayout>

      <h1 className="text-2xl font-bold text-purple-400 mb-6">
        Results for: {concept}
      </h1>

      <div className="space-y-4">

        {results.map(dive => (

          <Link
            key={dive.id}
            to={`/d/${dive.id}`}
            className="block bg-gray-900 border border-gray-800 p-4 rounded-lg hover:bg-gray-800"
          >

            <p className="text-green-400 font-medium">
              {dive.title}
            </p>

            <p className="text-sm text-gray-400">
              by @{dive.username}
            </p>

          </Link>

        ))}

        {results.length === 0 && (
          <p className="text-gray-500">
            No dives found for this concept.
          </p>
        )}

      </div>

    </PublicLayout>

  )

}

export default SearchPage