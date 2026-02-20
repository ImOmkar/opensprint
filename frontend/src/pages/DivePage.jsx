import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { deepDiveService } from "../services/deepDiveService"
import Spinner from "../components/Spinner"
import LinkedMarkdown from "../components/LinkedMarkdown"
import { formatRelativeTime, formatExactTime } from "../utils/time"
import { backlinkService } from "../services/backlinkService"

function DivePage() {

  const { diveId } = useParams()
  const navigate = useNavigate()

  const [dive, setDive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backlinks, setBacklinks] = useState([])

  useEffect(() => {

    deepDiveService.getById(diveId)
      .then(async (data) => {
  
        setDive(data)
  
        const links = await backlinkService.get(diveId)
  
        setBacklinks(links)
  
        setLoading(false)
      })
      .catch(() => navigate("/dashboard"))
  
  }, [diveId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Spinner text="Loading deep dive..." />
      </div>
    )
  }

  if (!dive) {
    return (
      <div className="min-h-screen bg-black text-white p-10">
        Dive not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-10 max-w-4xl mx-auto">

      <button
        onClick={() => navigate(-1)}
        className="text-green-400 hover:underline mb-6"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-green-400 mb-3">
        {dive.title}
      </h1>

      <p
        className="text-xs text-gray-500 mb-6"
        title={formatExactTime(dive.created_at)}
      >
        Logged {formatRelativeTime(dive.created_at)}
      </p>

      <Section title="Problem" content={dive.problem} />
      <Section title="Hypothesis" content={dive.hypothesis} />
      <Section title="Tests" content={dive.tests} />
      <Section title="Conclusion" content={dive.conclusion} />

      {backlinks.length > 0 && (

        <div className="mt-10 border-t border-gray-800 pt-6">

            <h2 className="text-purple-400 font-semibold mb-4">
                Referenced by
            </h2>

            <div className="space-y-2">

                {backlinks.map(link => (

                <button
                    key={link._id}
                    onClick={() => navigate(`/dive/${link._id}`)}
                    className="block text-left w-full bg-gray-900 border border-gray-800 rounded p-3 hover:border-purple-500"
                >

                    <p className="text-green-400 font-semibold">
                    {link.title}
                    </p>

                    <p className="text-xs text-gray-500">
                    {formatRelativeTime(link.created_at)}
                    </p>

                </button>

                ))}

            </div>

        </div>

        )}

    </div>
  )

}

function Section({ title, content }) {

  if (!content) return null

  return (
    <div className="mb-6">

      <h2 className="text-gray-400 font-semibold mb-2">
        {title}
      </h2>

      <div className="bg-gray-900 border border-gray-800 rounded p-4">
        <LinkedMarkdown content={content} />
      </div>

    </div>
  )

}

export default DivePage