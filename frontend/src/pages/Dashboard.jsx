import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { formatRelativeTime, formatExactTime } from "../utils/time"
import { sprintService } from "../services/sprintService"
import { userService } from "../services/userService"
import ConfirmModal from "../components/ConfirmModal"
import Spinner from "../components/Spinner"
import { deepDiveService } from "../services/deepDiveService"
import PageHeader from "../components/PageHeader"
import DashboardLayout from "../components/DashboardLayout"
import StatGrid from "../components/StatGrid"
import SprintGrid from "../components/SprintGrid"
import SprintModal from "../components/SprintModal"
import ActivityHeatmap from "../components/ActivityHeatmap"
import toast from "react-hot-toast"

function Dashboard() {
  const [user, setUser] = useState(null)
  const [sprints, setSprints] = useState([])
  const [title, setTitle] = useState("")
  const [goal, setGoal] = useState("")
  const [editingId, setEditingId] = useState(null)
  const navigate = useNavigate()
  const [deleteSprintId, setDeleteSprintId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState("")
  const [globalTagCounts, setGlobalTagCounts] = useState({})
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    dives: 0
  })
  const [selectedGlobalTag, setSelectedGlobalTag] = useState(null)
  const [filteredDives, setFilteredDives] = useState([])
  const [loadingTagFilter, setLoadingTagFilter] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false)

  useEffect(() => {
    userService.getMe()
      .then(async data => {
        setUser(data)
        await Promise.all([
          loadSprints(),
          loadStats(),
          loadGlobalTags()
        ])

        setLoading(false)
      })
      .catch(() => navigate("/"))
  }, [])

  const loadSprints = async () => {
    const data = await sprintService.getMine()

    setSprints(data)

    const active = data.filter(s => s.status === "active").length
    const completed = data.filter(s => s.status === "completed").length

    setStats(prev => ({
      ...prev,
      active,
      completed
    }))
  }

  const loadStats = async () => {
    const data = await userService.getMyStats()

    setStats({
      active: data.active_sprints,
      completed: data.completed_sprints,
      dives: data.total_deep_dives
    })
  }

  const handleCreateSprint = async (e) => {
    e.preventDefault()

    const body = {
      title,
      goal,
      description,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    try{
      await sprintService.create(body)
      toast.success("Sprint created successfully")
      loadStats()
      setTitle("")
      setGoal("")
      setDescription("")
      loadSprints()
    } catch (err){
      toast.error("Failed to create a new sprint")
    }

  }

  const handleUpdateSprint = async (e) => {
    e.preventDefault()

    const body = {
      title,
      goal,
      description,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    try{
      await sprintService.update(editingId, body)
      toast.success("Sprint updated successfully")
      loadStats()
      setEditingId(null)
      setTitle("")
      setGoal("")
      loadSprints()
    } catch (err) {
      toast.error("Failed to update a sprint")
    }
  }

  const handleEditSprint = (sprint) => {
    setEditingId(sprint._id)
    setTitle(sprint.title)
    setGoal(sprint.goal)
    setDescription(sprint.description || "")
    setIsSprintModalOpen(true)
  }

  const confirmDeleteSprint = async () => {

    if (!deleteSprintId) return

    try{
      await sprintService.delete(deleteSprintId)
      toast.success("Sprint deleted successfully")
      setDeleteSprintId(null)
      loadSprints()
      loadStats()
    } catch (err) {
      toast.error("Failed to delete a Sprint")
    }
  }

  const handleToggleSprint = async (id) => {
    try{
      await sprintService.toggle(id)
      toast.success("Sprint status changed")
      loadSprints()
    } catch (err) {
      toast.error("Failed to change a sprint status")
    }
  }

  const loadGlobalTags = async () => {
    try {
      const sprints = await sprintService.getMine()

      const tagMap = {}

      for (const sprint of sprints) {
        const dives = await deepDiveService.getBySprint(sprint._id)

        dives.forEach(dive => {
          if (!dive.tags) return

          dive.tags.forEach(tag => {
            tagMap[tag] = (tagMap[tag] || 0) + 1
          })
        })
      }

      setGlobalTagCounts(tagMap)

    } catch (err) {
      console.error(err)
      toast.error(err || "Failed to load global tags")
    }
  }

  const handleGlobalTagClick = async (tag) => {

    setSelectedGlobalTag(tag)
    setLoadingTagFilter(true)

    try {

      const sprints = await sprintService.getMine()

      let allDives = []

      for (const sprint of sprints) {
        const dives = await deepDiveService.getBySprint(sprint._id)

        const tagged = dives
          .filter(dive => dive.tags?.includes(tag))
          .map(dive => ({
            ...dive,
            sprintTitle: sprint.title,
            sprintId: sprint._id
          }))

        allDives = [...allDives, ...tagged]
      }

      setFilteredDives(allDives)

    } catch (err) {
      console.error(err)
      toast.error(err || "Failure")
    }

    setLoadingTagFilter(false)
  }

  const handleSearch = async (query) => {

    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)

    try {

      const sprints = await sprintService.getMine()

      let allDives = []

      for (const sprint of sprints) {

        const dives = await deepDiveService.getBySprint(sprint._id)

        const enriched = dives.map(dive => ({
          ...dive,
          sprintTitle: sprint.title,
          sprintId: sprint._id
        }))

        allDives = [...allDives, ...enriched]
      }

      const q = query.toLowerCase()

      const filtered = allDives.filter(dive =>
        dive.title?.toLowerCase().includes(q) ||
        dive.problem?.toLowerCase().includes(q) ||
        dive.hypothesis?.toLowerCase().includes(q) ||
        dive.tests?.toLowerCase().includes(q) ||
        dive.conclusion?.toLowerCase().includes(q) ||
        dive.tags?.some(tag => tag.includes(q))
      )

      setSearchResults(filtered)

    } catch (err) {
      console.error(err)
      toast.error(err || "Failed to search")
    }

    setSearching(false)
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
    <DashboardLayout user={user}>
      <div className="px-4 sm:px-6 py-6">
        {/* header */}
        <PageHeader
          title="Dashboard"
          subtitle="Your engineering knowledge system"
          actionLabel="New Sprint"
          onAction={() => {
            setEditingId(null)
            setTitle("")
            setGoal("")
            setDescription("")
            setIsSprintModalOpen(true)
          }}
        />

        {/* sprint stats */}
        <StatGrid stats={stats} />

        {/* activity heatmap */}
        <div className="mb-6">
          <ActivityHeatmap />
        </div>


        <SprintGrid
          sprints={sprints}
          onEdit={handleEditSprint}
          onDelete={setDeleteSprintId}
          onToggle={handleToggleSprint}
        />


        <SprintModal
          isOpen={isSprintModalOpen}
          onClose={() => setIsSprintModalOpen(false)}
          editingId={editingId}
          title={title}
          goal={goal}
          description={description}
          setTitle={setTitle}
          setGoal={setGoal}
          setDescription={setDescription}
          onSubmit={editingId ? handleUpdateSprint : handleCreateSprint}
        />

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
    </DashboardLayout>
  )
}

export default Dashboard
