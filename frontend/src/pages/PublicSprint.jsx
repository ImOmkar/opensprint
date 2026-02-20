import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
// import { api } from "../api/client"
import { userService } from "../services/userService"
import { formatExactTime, formatRelativeTime } from "../utils/time"
import Spinner from "../components/Spinner"


function PublicSprint() {
  const { username, sprintId } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    userService.getPublicSprint(username, sprintId)
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => {
        setData(null)
        setLoading(false)
      })
  }, [username, sprintId])
  

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Not Found
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Spinner text="Loading sprint..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <div className="flex items-center gap-4 mb-10">
        <img
          src={data.user.avatar_url}
          alt="avatar"
          className="w-16 h-16 rounded-full"
        />
        <h2 className="text-2xl font-bold text-green-400">
          {data.user.username}
        </h2>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-green-400">
          {data.sprint.title}
        </h1>
        <p className="text-gray-400 mt-2">
          {data.sprint.goal}
        </p>
        <p
          className="text-xs text-gray-500 mt-2"
          title={formatExactTime(data.sprint.created_at)}
        >
          Created {formatRelativeTime(data.sprint.created_at)}
        </p>

        {data.sprint.completed_at && (
          <p
            className="text-xs text-blue-400 mt-1"
            title={formatExactTime(data.sprint.completed_at)}
          >
            Completed {formatRelativeTime(data.sprint.completed_at)}
          </p>
        )}

        <p className="text-sm text-gray-600 mt-2">
          Status: {data.sprint.status}
        </p>
      </div>

      <div className="space-y-6">
        {data.deep_dives.length === 0 && (
          <p className="text-gray-500">No deep dives yet.</p>
        )}

        {data.deep_dives.map(dive => (
          <div
            key={dive._id}
            className="bg-gray-900 p-6 rounded border border-gray-800"
          >
            <h3 className="text-xl font-bold text-green-400 mb-3">
              {dive.title}
            </h3>

            <div className="space-y-2 text-gray-300">
              <p><strong>Problem:</strong> {dive.problem}</p>
              <p><strong>Hypothesis:</strong> {dive.hypothesis}</p>
              <p><strong>Tests:</strong> {dive.tests}</p>
              <p><strong>Conclusion:</strong> {dive.conclusion}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default PublicSprint
