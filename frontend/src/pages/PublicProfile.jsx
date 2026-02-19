import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
// import { api } from "../api/client"
import { userService } from "../services/userService"


function PublicProfile() {
  const { username } = useParams()
  const [data, setData] = useState(null)

  useEffect(() => {
    userService.getPublicProfile(username)
      .then(data => setData(data))
      .catch(() => setData(null))
  }, [username])
  

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Not Found
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

      <h3 className="text-xl font-semibold mb-6">Sprints</h3>

      <div className="grid gap-4">
        {data.sprints.length === 0 && (
          <p className="text-gray-500">No sprints yet.</p>
        )}

        {data.sprints.map(sprint => (
          <Link
            key={sprint._id}
            to={`/u/${data.user.username}/${sprint._id}`}
            className="bg-gray-900 p-4 rounded border border-gray-800 hover:border-green-500 transition block"
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

    </div>
  )
}

export default PublicProfile
