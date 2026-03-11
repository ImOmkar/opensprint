import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { userService } from "../services/userService"
import Spinner from "../components/Spinner"
import PublicLayout from "../components/PublicLayout"
import { timelineService } from "../services/timelineService"

function PublicProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [timeline, setTimeline] = useState({})
  const [concepts, setConcept] = useState([])
  const [activeTab, setActiveTab] = useState("sprints")
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {

    Promise.all([
      userService.getPublicProfile(username),
      timelineService.getPublic(username),
      userService.getPublicActivity(username),
      userService.getConcepts(username),
    ])
      .then(([profile, timelineData, activity, conceptData]) => {
        setData(profile)
        setTimeline(timelineData)
        setStats(activity)
        setConcept(conceptData.concepts || [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setData(null)
      })

  }, [username])

  // console.log("concepts", concepts)

  // if (!data) {
  //   return (
  //     <div className="min-h-screen bg-black text-white flex items-center justify-center">
  //       <Spinner text="Loading profile..." />
  //     </div>
  //   )
  // }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Spinner text="Loading profile..." />
      </div>
    )
  }

  return (
    <PublicLayout>

      {/* Profile Header */}
      <div className="
        flex items-center gap-5
        mb-6
        bg-gray-900/60
        border border-gray-800
        rounded-xl
        p-5">

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

      {/* curiosity */}
      {data.user.curiosity && (
        <div className="
          mb-6
          bg-gray-900/60
          border border-gray-800
          rounded-xl
          p-4
        ">
          <p className="text-xs text-gray-500 mb-1">
          🤔 Current Curiosity
          </p>

          <p className="text-white">
            {data.user.curiosity}
          </p>
        </div>
      )}

      {/* explored concepts */}
      {concepts.length > 0 && (
        <div className="
          mb-6
          bg-gray-900/60
          border border-gray-800
          rounded-xl
          p-5
        ">

          <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">
          🕵🏼‍♂️ Explored Concepts
          </p>

          <div className="flex flex-wrap gap-2">

            {concepts.map((concept) => (
              <button
                onClick={() => navigate(`/d/${concept.dive_id}`)}
                key={concept.name}
                className="
                  px-3 py-1
                  text-sm
                  bg-purple-500/10
                  text-purple-300
                  border border-purple-500/20
                  rounded-full
                "
              >
                {concept.name}
              </button>
            ))}

          </div>

        </div>
      )}

      {/* open question  */}
      {data?.user?.open_question && (
        <div
          className="
            mb-4
            bg-gray-900/60
            border border-gray-800
            rounded-xl
            p-4
          "
        >
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          ❓ Open Question
          </p>

          <p className="text-white text-sm">
            {data?.user?.open_question}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-8 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          <button
            onClick={() => setActiveTab("sprints")}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === "sprints"
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-white"
            }`}>
            Sprints
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === "timeline"
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-white"
            }`}>
            Timeline
          </button>
        </div>
      </div>

      {/* SPRINTS TAB */}
      {activeTab === "sprints" && (
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
              className="
                bg-gray-900
                p-4
                rounded-xl
                border border-gray-800
                hover:border-green-500
                transition
                block
              "
            >
              <h4 className="text-lg font-bold text-green-400">
                {sprint.title}
              </h4>

              <p className="text-gray-400">
                {sprint.goal}
              </p>

              <p className="text-sm text-gray-600 mt-2">
                Status: {sprint.status}
              </p>

            </Link>
          ))}

        </div>
      )}

      {/* Timeline TAB */}
      {activeTab === "timeline" && (

        <div className="relative border-l border-gray-800 pl-6 space-y-8">

          {Object.keys(timeline).length === 0 && (
            <p className="text-gray-500">
              No activity yet
            </p>
          )}

          {Object.keys(timeline)
            .sort((a, b) => new Date(b) - new Date(a))
            .map(date => (

              <div key={date}>

                <div className="text-sm text-gray-400 mb-3">
                  {new Date(date).toDateString()}
                </div>

                <div className="space-y-3">

                  {timeline[date].map(dive => (

                    <Link
                      key={dive.id}
                      to={`/d/${dive.id}`}
                      className="
                        block
                        bg-gray-900
                        border border-gray-800
                        rounded-lg
                        p-4
                        hover:border-green-500
                        transition
                      "
                    >
                      <p className="text-green-400 font-medium">
                        {dive.title}
                      </p>

                    </Link>

                  ))}

                </div>

              </div>

          ))}

        </div>
      )}

      {/* Timeline */}
      {/* <h3 className="text-xl font-semibold mb-6">
        Knowledge Timeline
      </h3>

      <div className="relative border-l border-gray-800 pl-6 space-y-8 mb-12">

        {Object.keys(timeline).length === 0 && (
          <p className="text-gray-500">
            No activity yet
          </p>
        )}

        {Object.keys(timeline)
          .sort((a, b) => new Date(b) - new Date(a))
          .map(date => (

            <div key={date} className="relative">

              <div className="text-sm text-gray-400 mb-3">
                {new Date(date).toDateString()}
              </div>

              <div className="space-y-3">

                {timeline[date].map(dive => (

                  <Link
                    key={dive.id}
                    to={`/u/${data.user.username}/${dive.sprint_id}`}
                    className="
                      block
                      bg-gray-900
                      border border-gray-800
                      rounded-lg
                      p-4
                      hover:border-green-500
                      transition
                    "
                  >
                    <p className="text-green-400 font-medium">
                      {dive.title}
                    </p>
                  </Link>

                ))}

              </div>

            </div>

          ))}

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
      </div> */}

    </PublicLayout>
  )
}

export default PublicProfile
