import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
// import { api } from "../api/client"
import { userService } from "../services/userService"
import Spinner from "../components/Spinner"
import PublicLayout from "../components/PublicLayout"


function PublicProfile() {
  const { username } = useParams()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService.getPublicProfile(username)
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => {
        setData(null)
        setLoading(false)
      })
  }, [username])
  

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
        <Spinner text="Loading profile..." />
      </div>
    )
  }

  return (
    <PublicLayout>

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

      <h3 className="text-xl font-semibold mb-6">Sprints</h3>

      <div className="grid gap-4">
        {data.sprints.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded p-8 text-center">

            <h3 className="text-lg font-semibold text-green-400 mb-2">
              No public sprints yet
            </h3>

            <p className="text-gray-400">
              This user hasn't started any sprints.
            </p>

          </div>
        )}

        {data.sprints.map(sprint => (
          <Link
            key={sprint._id}
            to={`/u/${data.user.username}/${sprint._id}`}
            className="bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-green-500 transition block"
          >
            <h4 className="text-lg font-bold text-green-400">
              {sprint.title}
            </h4>
            <p className="text-gray-400">{sprint.goal}</p>
            <p className="text-sm text-gray-600 mt-2">
              Status: {sprint.status}
            </p>
          </Link>
        ))}
      </div>

    </PublicLayout>
  )
}

export default PublicProfile
