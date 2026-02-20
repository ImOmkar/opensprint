import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
// import { api } from "../api/client"
import { formatRelativeTime, formatExactTime } from "../utils/time"
import { deepDiveService } from "../services/deepDiveService"
import { sprintService } from "../services/sprintService"
import { userService } from "../services/userService"
import ConfirmModal from "../components/ConfirmModal"


function SprintDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)

  const [dives, setDives] = useState([])
  const [title, setTitle] = useState("")
  const [problem, setProblem] = useState("")
  const [hypothesis, setHypothesis] = useState("")
  const [tests, setTests] = useState("")
  const [conclusion, setConclusion] = useState("")

  const [sprint, setSprint] = useState(null)
  const [editingDiveId, setEditingDiveId] = useState(null)
  const [deleteDiveId, setDeleteDiveId] = useState(null)

  useEffect(() => {
    userService.getMe()
    .then(data => setUser(data))
    .catch(() => navigate("/"))

    loadSprint()
    loadDives()
  }, [])

  const loadSprint = () => {
    sprintService.getMine()
      .then(data => {
        const current = data.find(s => s._id === id)
        if (current) setSprint(current)
      })
      .catch(err => console.error(err))
  }
  
  
  const loadDives = () => {
    deepDiveService.getBySprint(id)
      .then(data => setDives(data))
      .catch(() => navigate("/"))
  }
  

  const handleCreateDive = async (e) => {
    e.preventDefault()

    const body = {
      sprint_id: id,
      title,
      problem,
      hypothesis,
      tests,
      conclusion
    }

    await deepDiveService.create(body)


    setTitle("")
    setProblem("")
    setHypothesis("")
    setTests("")
    setConclusion("")
    loadDives()
  }

  const confirmDeleteDive = async () => {

    if (!deleteDiveId) return
  
    await deepDiveService.delete(deleteDiveId)
  
    setDeleteDiveId(null)
  
    loadDives()
  }

  const handleEditDive = (dive) => {
    setEditingDiveId(dive._id)
    setTitle(dive.title)
    setProblem(dive.problem)
    setHypothesis(dive.hypothesis)
    setTests(dive.tests)
    setConclusion(dive.conclusion)
  }
  
  const handleUpdateDive = async (e) => {
    e.preventDefault()
  
    const body = {
      sprint_id: id,
      title,
      problem,
      hypothesis,
      tests,
      conclusion
    }
  
    await deepDiveService.update(editingDiveId, body)

  
    setEditingDiveId(null)
    setTitle("")
    setProblem("")
    setHypothesis("")
    setTests("")
    setConclusion("")
    loadDives()
  }

  const handleCopyLink = () => {
    if (!user) return
  
    const link = `${window.location.origin}/u/${user.username}/${id}`
  
    navigator.clipboard.writeText(link)
  
    alert("Public link copied")
  }
  
  
  
  return (
    <div className="min-h-screen bg-black text-white p-10">

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 text-green-400 hover:underline"
      >
        ← Back
      </button>

      <div className="flex justify-between items-center mb-6">

      {!sprint ? (
        <div className="text-gray-500">Loading sprint...</div>
      ) : (
        <div className="mb-8 bg-gray-900 p-6 rounded border border-gray-800">

          <div className="flex justify-between items-start">

            <div>

              <div className="flex items-center gap-3">

                <h1 className="text-3xl font-bold text-green-400">
                  {sprint.title}
                </h1>

                {sprint.status === "completed" && (
                  <span className="text-xs bg-blue-500 text-black px-2 py-1 rounded">
                    Completed
                  </span>
                )}

              </div>

              <p className="text-gray-400 mt-2">
                {sprint.goal}
              </p>

              <p
                className="text-xs text-gray-500 mt-3"
                title={formatExactTime(sprint.created_at)}
              >
                Created {formatRelativeTime(sprint.created_at)}
              </p>

              {sprint.completed_at && (
                <p
                  className="text-xs text-blue-400 mt-1"
                  title={formatExactTime(sprint.completed_at)}
                >
                  Completed {formatRelativeTime(sprint.completed_at)}
                </p>
              )}

            </div>

            {user && (
              <button
                onClick={handleCopyLink}
                className="bg-green-500 text-black px-4 py-2 rounded font-semibold hover:bg-green-400"
              >
                Copy Public Link
              </button>
            )}

          </div>

        </div>
      )}


      </div>


      {/* Create Deep Dive */}
      {sprint && sprint.status === "active" && (
        <form onSubmit={editingDiveId ? handleUpdateDive : handleCreateDive} className="mb-10 bg-gray-900 p-6 rounded-lg">
            <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-3 p-2 rounded bg-black border border-gray-700"
            required
            />

            <textarea
            placeholder="Problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full mb-3 p-2 rounded bg-black border border-gray-700"
            required
            />

            <textarea
            placeholder="Hypothesis"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            className="w-full mb-3 p-2 rounded bg-black border border-gray-700"
            required
            />

            <textarea
            placeholder="Tests Performed"
            value={tests}
            onChange={(e) => setTests(e.target.value)}
            className="w-full mb-3 p-2 rounded bg-black border border-gray-700"
            required
            />

            <textarea
            placeholder="Conclusion"
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            className="w-full mb-3 p-2 rounded bg-black border border-gray-700"
            required
            />

            <button
            type="submit"
            className="bg-green-500 px-4 py-2 rounded text-black font-semibold hover:bg-green-400"
            >
            {editingDiveId ? "Update Deep Dive" : "Add Deep Dive"}
            </button>
        </form>
      )}

    {sprint && sprint.status === "completed" && (
    <p className="text-blue-400 mb-6">
        This sprint is completed. Deep dives are locked.
    </p>
    )}


      {/* Deep Dive List */}
      <div className="space-y-4">
        {dives.length === 0 && (
          <p className="text-gray-500">No deep dives yet.</p>
        )}

        {dives.map(dive => (
          <div key={dive._id} className="bg-gray-900 p-4 rounded border border-gray-800">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-green-400">
                {dive.title}
                </h3>

                <p
                  className="text-xs text-gray-500 mb-2"
                  title={formatExactTime(dive.created_at)}
                >
                  Logged {formatRelativeTime(dive.created_at)}
                </p>


                {sprint && sprint.status === "active" && (
                <div className="flex gap-3">
                    <button
                    onClick={() => handleEditDive(dive)}
                    className="text-yellow-400 hover:underline text-sm"
                    >
                    Edit
                    </button>

                    <button
                    // onClick={() => handleDeleteDive(dive._id)}
                    onClick={() => setDeleteDiveId(dive._id)}
                    className="text-red-500 hover:underline text-sm"
                    >
                    Delete
                    </button>
                </div>
                )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteDiveId}
        title="Delete Deep Dive"
        message="Are you sure you want to delete this deep dive? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteDive}
        onCancel={() => setDeleteDiveId(null)}
      />

    </div>
  )
}

export default SprintDetail
