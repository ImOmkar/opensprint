import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { deepDiveService } from "../services/deepDiveService"
import { backlinkService } from "../services/backlinkService"
import Spinner from "../components/Spinner"
import LinkedMarkdown from "../components/LinkedMarkdown"
import { formatRelativeTime, formatExactTime } from "../utils/time"
import DashboardLayout from "../components/DashboardLayout"
import { userService } from "../services/userService"

function DivePage() {

  const { diveId } = useParams()
  const navigate = useNavigate()

  const [dive, setDive] = useState(null)
  const [backlinks, setBacklinks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    Promise.all([
      deepDiveService.getById(diveId),
      userService.getMe()
    ])
      .then(async ([data, userData]) => {

        setDive(data)
        setUser(userData)

        const links = await backlinkService.get(diveId)
        setBacklinks(links)

        setLoading(false)
      })
      .catch(() => navigate("/dashboard"))

  }, [diveId])

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="p-10">
          <Spinner text="Loading deep dive..." />
        </div>
      </DashboardLayout>
    )
  }

  if (!dive) {
    return (
      <DashboardLayout user={user}>
        <div className="p-10 text-gray-400">
          Dive not found
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>

      <div className="mx-auto px-6 py-4">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-green-400 hover:underline hover:underline-offset-4 mb-8"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-10">

          <h1 className="text-4xl font-bold text-green-400 mb-3 leading-tight">
            {dive.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">

            <span title={formatExactTime(dive.created_at)}>
              Logged {formatRelativeTime(dive.created_at)}
            </span>

            {dive.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {dive.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Sections */}
        <Section title="Problem" content={dive.problem} />
        <Section title="Hypothesis" content={dive.hypothesis} />
        <Section title="Tests" content={dive.tests} />
        <Section title="Conclusion" content={dive.conclusion} />

        {/* Backlinks */}
        {backlinks.length > 0 && (

          <div className="mt-16">

            <h2 className="text-xl font-semibold text-purple-400 mb-6">
              Referenced By
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">

              {backlinks.map(link => (

                <button
                  key={link._id}
                  onClick={() => navigate(`/dive/${link._id}`)}
                  className="
                    bg-gray-900/60
                    backdrop-blur
                    border border-gray-800
                    rounded-xl
                    p-5
                    text-left
                    hover:border-purple-500
                    transition
                  "
                >

                  <p className="text-green-400 font-semibold mb-2">
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

    </DashboardLayout>
  )

}

function Section({ title, content }) {

  if (!content) return null

  return (
    <div className="mb-12">

      <h2 className="text-gray-400 font-semibold mb-4 tracking-wide">
        {title}
      </h2>

      <div className="
        bg-gray-900/70
        backdrop-blur
        border border-gray-800
        rounded-xl
        p-6
      ">
        <LinkedMarkdown content={content} />
      </div>

    </div>
  )

}

export default DivePage