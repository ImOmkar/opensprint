import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { deepDiveService } from "../services/deepDiveService"
import { backlinkService } from "../services/backlinkService"
import Spinner from "../components/Spinner"
import LinkedMarkdown from "../components/LinkedMarkdown"
import PublicLayout from "../components/PublicLayout"

function PublicDive() {
  const { diveId } = useParams()
  const [backlinks, setBacklinks] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    deepDiveService.getPublicDive(diveId)
      .then(setData)
      .finally(() => setLoading(false))
    backlinkService.getPublicBacklinks(diveId)
       .then(setBacklinks)
       .catch(() => setBacklinks([]))
  }, [diveId])

  if (loading) {
    return <Spinner text="Loading dive..." />
  }

  if (!data) {
    return <div className="text-white p-10">Dive not found</div>
  }

  const { dive, user, sprint } = data

  return (
    <PublicLayout>

      <h1 className="text-3xl text-green-400 font-bold mb-4">
        {dive.title}
      </h1>

      <p className="text-gray-400 mb-6">
        by <Link className="hover:underline hover:underline-offset-4 hover:text-green-400" to={`/u/${user.username}`}>u/{user?.username}</Link> • <Link className="hover:underline hover:underline-offset-4 hover:text-green-400" to={`/u/${user.username}/${sprint._id}`}>{sprint.title}</Link>
      </p>

      {dive.problem && (
        <Section title="Problem" content={dive.problem} />
      )}

      {dive.hypothesis && (
        <Section title="Hypothesis" content={dive.hypothesis} />
      )}

      {dive.tests && (
        <Section title="Tests" content={dive.tests} />
      )}

      {dive.conclusion && (
        <Section title="Conclusion" content={dive.conclusion} />
      )}

        {backlinks.length > 0 && (

        <div className="mt-12 border-t border-gray-800 pt-6">

        <h2 className="text-purple-400 font-semibold mb-4">
            Referenced by
        </h2>

        <div className="space-y-2">

            {backlinks.map(link => (

            <Link
                key={link._id}
                to={`/d/${link._id}`}
                className="
                block
                w-full
                text-left
                bg-gray-900
                border border-gray-800
                rounded-lg
                p-3
                hover:border-purple-500
                transition
                "
            >

                <p className="text-green-400 font-semibold">
                {link.title}
                </p>

            </Link>

            ))}

        </div>

        </div>

        )}

    </PublicLayout>
  )
}

function Section({ title, content }) {

  return (
    <div className="mb-8">

      <h2 className="text-gray-400 mb-2">
        {title}
      </h2>

      <div className="prose prose-invert max-w-none text-sm bg-gray-950 border border-gray-800 rounded-xl p-4">
        <LinkedMarkdown content={content} mode="public" />
      </div>

    </div>
  )

}

export default PublicDive