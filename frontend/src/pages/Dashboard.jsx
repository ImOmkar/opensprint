import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
// import { api } from "../api/client"
import { formatRelativeTime, formatExactTime } from "../utils/time"
import { sprintService } from "../services/sprintService"
import { userService } from "../services/userService"
import { deepDiveService } from "../services/deepDiveService"
import ConfirmModal from "../components/ConfirmModal"
import Spinner from "../components/Spinner"

function Dashboard() {
  const [user, setUser] = useState(null)
  const [sprints, setSprints] = useState([])
  const [title, setTitle] = useState("")
  const [goal, setGoal] = useState("")
  const [editingId, setEditingId] = useState(null)
  const navigate = useNavigate()
  const [deleteSprintId, setDeleteSprintId] = useState(null)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    dives: 0
  })

  useEffect(() => {
    userService.getMe()
      .then(data => {
        setUser(data)
        return Promise.all([
          sprintService.getMine(),
          userService.getMyStats()
        ])
      })
      .then(([sprintsData, statsData]) => {
  
        setSprints(sprintsData)
  
        setStats({
          active: statsData.active_sprints,
          completed: statsData.completed_sprints,
          dives: statsData.total_deep_dives
        })
  
        setLoading(false)
      })
      .catch(() => navigate("/"))
  }, [])

  const loadSprints = () => {
    sprintService.getMine()
      .then(data => {
        setSprints(data)
  
        const active = data.filter(s => s.status === "active").length
        const completed = data.filter(s => s.status === "completed").length
  
        setStats(prev => ({
          ...prev,
          active,
          completed
        }))
  
        // loadDiveStats(data)
      })
  }

  // const loadDiveStats = async (sprints) => {
  //   try {
  //     let total = 0
  
  //     for (const sprint of sprints) {
  //       const dives = await deepDiveService.getBySprint(sprint._id)
  //       total += dives.length
  //     }
  
  //     setStats(prev => ({
  //       ...prev,
  //       dives: total
  //     }))
  //   } catch (err) {
  //     console.error(err)
  //   }
  // }

  const loadStats = () => {
    userService.getMyStats()
      .then(data => {
        setStats({
          active: data.active_sprints,
          completed: data.completed_sprints,
          dives: data.total_deep_dives
        })
      })
      .catch(err => console.error(err))
  }

  const handleCreateSprint = async (e) => {
    e.preventDefault()

    const body = {
      title,
      goal,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString()
    }

    await sprintService.create(body)
    loadStats()

    setTitle("")
    setGoal("")
    loadSprints()
  }

  const handleUpdateSprint = async (e) => {
    e.preventDefault()
  
    const body = {
      title,
      goal,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString()
    }
  
    await sprintService.update(editingId, body)
    loadStats()

  
    setEditingId(null)
    setTitle("")
    setGoal("")
    loadSprints()
  }

  const handleEditSprint = (sprint) => {
    setEditingId(sprint._id)
    setTitle(sprint.title)
    setGoal(sprint.goal)
  }

  const confirmDeleteSprint = async () => {

    if (!deleteSprintId) return
  
    await sprintService.delete(deleteSprintId)
  
    setDeleteSprintId(null)
  
    loadSprints()
    loadStats()
  }

  const handleToggleSprint = async (id) => {
    await sprintService.toggle(id)
  
    loadSprints()
  }
  

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Spinner text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <div className="flex items-center gap-4 mb-10">
        <img
          src={user.avatar_url}
          alt="avatar"
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h2 className="text-2xl font-bold text-green-400">
            {user.username}
          </h2>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="bg-gray-900 p-6 rounded border border-gray-800">
          <p className="text-gray-400 text-sm">Active Sprints</p>
          <p className="text-2xl font-bold text-green-400">
            {stats.active}
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded border border-gray-800">
          <p className="text-gray-400 text-sm">Completed Sprints</p>
          <p className="text-2xl font-bold text-blue-400">
            {stats.completed}
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded border border-gray-800">
          <p className="text-gray-400 text-sm">Total Deep Dives</p>
          <p className="text-2xl font-bold text-purple-400">
            {stats.dives}
          </p>
        </div>

      </div>

      {/* Create Sprint */}
      <form 
        onSubmit={editingId ? handleUpdateSprint : handleCreateSprint} 
        className="mb-10 bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">
        {editingId ? "Update Sprint" : "Create Sprint"}
        </h3>

        <input
          type="text"
          placeholder="Sprint Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-black border border-gray-700"
          required
        />

        <textarea
          placeholder="Sprint Goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-black border border-gray-700"
          required
        />

        <button
          type="submit"
          className="bg-green-500 px-4 py-2 rounded text-black font-semibold hover:bg-green-400"
        >
          {editingId ? "Update" : "Create"}
        </button>
      </form>

      {/* Sprint List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Your Sprints</h3>

        {sprints.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded p-10 text-center">

            <h3 className="text-xl font-semibold text-green-400 mb-2">
              No sprints yet
            </h3>

            <p className="text-gray-400 mb-4">
              Start your first sprint and document your engineering journey.
            </p>

            <p className="text-gray-500 text-sm">
              Create a sprint above to begin logging deep dives.
            </p>

          </div>
        )}

        <div className="grid gap-4">
          {sprints.map(sprint => (
            <div
              key={sprint._id}
              className={`p-4 rounded border transition ${
              sprint.status === "completed"
                ? "bg-gray-800 border-blue-500 opacity-80"
                : "bg-gray-900 border-gray-800 hover:border-green-500"
            }`}

            >

              <div className="flex justify-between items-start">
                <div
                  onClick={() => navigate(`/sprint/${sprint._id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">

                    <h4 className="text-lg font-bold text-green-400">
                      {sprint.title}
                    </h4>

                    {sprint.status === "completed" && (
                      <span className="text-xs bg-blue-500 text-black px-2 py-1 rounded">
                        Completed
                      </span>
                    )}

                  </div>

                  <p className="text-gray-400">{sprint.goal}</p>
                  <p
                    className="text-xs text-gray-500 mt-2"
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

                  <p className="text-sm text-gray-600 mt-2">
                    Status: {sprint.status}
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => handleToggleSprint(sprint._id)}
                    className={`text-sm ${
                      sprint.status === "completed"
                        ? "text-blue-400"
                        : "text-green-400"
                    } hover:underline`}
                  >
                    {sprint.status === "completed" ? "Reopen" : "Complete"}
                  </button>

                  <button
                    onClick={() => handleEditSprint(sprint)}
                    className="text-yellow-400 hover:underline text-sm"
                  >
                    Edit
                  </button>

                  <button
                    // onClick={() => handleDeleteSprint(sprint._id)}
                    onClick={() => setDeleteSprintId(sprint._id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

            </div>
          ))}

        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteSprintId}
        title="Delete Sprint"
        message="Are you sure you want to delete this sprint? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteSprint}
        onCancel={() => setDeleteSprintId(null)}
      />

    </div>
  )
}

export default Dashboard
