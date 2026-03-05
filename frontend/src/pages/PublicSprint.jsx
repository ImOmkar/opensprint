import { useEffect, useState } from "react"
import { useParams,useNavigate } from "react-router-dom"
// import { api } from "../api/client"
import { userService } from "../services/userService"
import { formatExactTime, formatRelativeTime } from "../utils/time"
import Spinner from "../components/Spinner"
import PublicLayout from "../components/PublicLayout"
import LinkedMarkdown from "../components/LinkedMarkdown"


function PublicSprint() {
  const navigate = useNavigate()
  const { username, sprintId } = useParams()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  // useEffect(() => {
  //   userService.getPublicSprint(username, sprintId)
  //     .then(data => {
  //       setData(data)
  //       setLoading(false)
  //     })
  //     .catch(() => {
  //       setData(null)
  //       setLoading(false)
  //     })
  // }, [username, sprintId])

  useEffect(() => {

    Promise.all([
      userService.getPublicSprint(username, sprintId),
      userService.getPublicActivity(username)
    ])
      .then(([profile, activity]) => {
        setData(profile)
        setStats(activity)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setData(null)
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
    <PublicLayout>

      {/* <div className="flex items-center gap-4 mb-10">
        <img
          src={data.user.avatar_url}
          alt="avatar"
          className="w-16 h-16 rounded-full"
        />
        <h2 className="text-2xl font-bold text-green-400">
          {data.user.username}
        </h2>
      </div> */}

      {/* Profile Header */}
      <div className="
        flex items-center gap-5
        mb-10
        bg-gray-900/60
        border border-gray-800
        rounded-xl
        p-5
      ">

        {/* Avatar */}
        <div className="p-[2px] rounded-full bg-gradient-to-br from-green-500/40 to-purple-500/40">
          <img
            src={data.user.avatar_url}
            alt="avatar"
            className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Info */}
        <div>

          <div className="flex items-center gap-3 flex-wrap">

            <h2 className="text-2xl font-bold text-white">
              {data.user.username}
            </h2>

            {stats?.current_streak > 0 && (
              <div className="
                flex items-center gap-1
                text-xs
                bg-orange-500/15
                border border-orange-500/40
                text-orange-400
                px-3 py-1
                rounded-full
                font-medium
              ">
                🔥 {stats.current_streak} day streak
              </div>
            )}

          </div>

          <p className="text-sm text-gray-400 mt-1">
            Learning in public
          </p>

        </div>

      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-green-400">
          {data.sprint.title}
        </h1>

        <p className="text-gray-400 mt-2">
          {data.sprint.goal}
        </p>

        {data.sprint.description && (
          <p className="text-gray-500 mt-3 whitespace-pre-wrap">
            {data.sprint.description}
          </p>
        )}

        <p
          className="text-xs text-gray-500 mt-2"
          title={formatExactTime(data.sprint.created_at)}>
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
          Status: <span className="capitalize text-white">{data.sprint.status}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {data.deep_dives.length === 0 && (
          <p className="text-gray-500">No deep dives yet.</p>
        )}

        {data.deep_dives.map(dive => (
          <div
            key={dive._id}
            id={dive._id}
            onClick={() => navigate(`/d/${dive._id}`)}
            className="bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-purple-500 cursor-pointer transition">

            <h3 className="text-xl font-bold text-green-400">
              {dive.title}
            </h3>

            <p className="text-xs text-gray-500">
              {formatRelativeTime(dive.created_at)}
            </p>

            {/* <div id={dive._id} className="space-y-6">

              {dive.problem && (
                <div>
                  <h4 className="text-sm text-gray-400 font-semibold mb-2">
                    Problem
                  </h4>
                  <div className="prose prose-invert max-w-none text-sm bg-gray-950 border border-gray-800 rounded-lg p-4">
                    <LinkedMarkdown 
                      content={dive.problem} 
                      mode="public"
                      username={data.user.username}
                      sprintId={data.sprint._id}
                    />
                  </div>
                </div>
              )}

              {dive.hypothesis && (
                <div>
                  <h4 className="text-sm text-gray-400 font-semibold mb-2">
                    Hypothesis
                  </h4>
                  <div className="prose prose-invert max-w-none text-sm bg-gray-950 border border-gray-800 rounded-lg p-4">
                    <LinkedMarkdown 
                      content={dive.hypothesis} 
                      mode="public"
                      username={data.user.username}
                      sprintId={data.sprint._id}
                    />
                  </div>
                </div>
              )}

              {dive.tests && (
                <div>
                  <h4 className="text-sm text-gray-400 font-semibold mb-2">
                    Tests
                  </h4>
                  <div className="prose prose-invert max-w-none text-sm bg-gray-950 border border-gray-800 rounded-lg p-4">
                    <LinkedMarkdown 
                      content={dive.tests} 
                      mode="public"
                      username={data.user.username}
                      sprintId={data.sprint._id}
                    />
                  </div>
                </div>
              )}

              {dive.conclusion && (
                <div>
                  <h4 className="text-sm text-gray-400 font-semibold mb-2">
                    Conclusion
                  </h4>
                  <div className="prose prose-invert max-w-none text-sm bg-gray-950 border border-gray-800 rounded-lg p-4">
                    <LinkedMarkdown 
                      content={dive.conclusion} 
                      mode="public"
                      username={data.user.username}
                      sprintId={data.sprint._id}
                    />
                  </div>
                </div>
              )}

            </div> */}
          </div>
        ))}
      </div>

    </PublicLayout>
  )
}

export default PublicSprint
