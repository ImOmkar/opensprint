import { useEffect, useState, useRef } from "react"
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
import ConceptRadar from "../components/ConceptRadar"
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
  const [curiosity, setCuriosity] = useState("")
  const [editingCuriosity, setEditingCuriosity] = useState(false)
  const [savingCuriosity, setSavingCuriosity] = useState(false)
  const [openQuestion, setOpenQuestion] = useState("")
  const [editingQuestion, setEditingQuestion] = useState(false)
  
  const questionRef = useRef(null)
  const originalQuestion = useRef("")

  const curiosityRef = useRef(null)
  const originalCuriosity = useRef(curiosity)

  const [activityFeed, setActivityFeed] = useState([])
  const [conceptRadar, setConceptRadar] = useState([])


  useEffect(() => {
    userService.getMe()
      .then(async data => {
        setUser(data)
        setCuriosity(data?.curiosity || "")
        setOpenQuestion(data?.open_question || "")
        originalQuestion.current = data?.open_question || ""
        await Promise.all([
          loadSprints(),
          loadStats(),
          loadGlobalTags(),
          loadConceptRadar(),
          // loadActivityFeed()
        ])

        setLoading(false)
      })
      .catch(() => navigate("/"))
  }, [])

  useEffect(() => {

    function handleClickOutside(event) {
  
      if (
        editingCuriosity &&
        curiosityRef.current &&
        !curiosityRef.current.contains(event.target)
      ) {
  
        setEditingCuriosity(false)
        saveCuriosity()
  
      }
  
    }
  
    document.addEventListener("mousedown", handleClickOutside)
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  
  }, [editingCuriosity, curiosity])

  const loadConceptRadar = async () => {
    try {
      const data = await userService.getConceptRadar()
      setConceptRadar(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadActivityFeed = async () => {
    try{
      const data = await deepDiveService.getActivityFeed()
      setActivityFeed(data)
    } catch (err) {
      console.error(err)
    }
  }

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

  const saveCuriosity = async () => {

    if (curiosity === originalCuriosity.current) {
      return
    }
  
    try {
  
      setSavingCuriosity(true)

      console.log(curiosity)
  
      const value = curiosity?.trim()
  
      await userService.updateCuriosity({
        curiosity: value || null
      })
  
      originalCuriosity.current = value
  
      toast.success("Curiosity updated")
  
    } catch {
  
      toast.error("Failed to update curiosity")
  
    }
  
    setSavingCuriosity(false)
  
  }

  const saveOpenQuestion = async () => {

    if (openQuestion === originalQuestion.current) return
  
    try {
  
      const value = openQuestion?.trim()
  
      await userService.updateOpenQuestion({
        open_question: value || null
      })
  
      originalQuestion.current = value
  
      toast.success("Open question updated")
  
    } catch {
  
      toast.error("Failed to update question")
  
    }
  
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

        {/* Current Curiosity */}
        <div
          ref={curiosityRef}
          className="
            mb-6
            bg-gray-900/60
            border border-gray-800
            rounded-xl
            p-4
          ">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          🤔 Current Curiosity
          </p>
          {!editingCuriosity ? (
            <p
              onClick={() => setEditingCuriosity(true)}
              className="
                text-white
                text-sm
                cursor-text
                hover:text-purple-400
              "
            >
              {curiosity || "Click to add what you're exploring right now"}
            </p>
          ) : (
            <input
              autoFocus
              value={curiosity}
              onChange={(e) => setCuriosity(e.target.value)}
              className="
                w-full
                bg-gray-950
                border border-purple-500
                rounded-lg
                px-3 py-2
                text-sm
                text-white
                focus:outline-none
              "
            />

          )}
        </div>
        
        {/* current question */}
        <div
          ref={questionRef}
          className="
            mb-6
            bg-gray-900/60
            border border-gray-800
            rounded-xl
            p-4
          "
        >

          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Open Question
          </p>

          {!editingQuestion ? (

            <p
              onClick={() => setEditingQuestion(true)}
              className="text-white text-sm cursor-text hover:text-purple-400"
            >
              {openQuestion || "Click to add something you're trying to understand"}
            </p>

          ) : (

            <input
              autoFocus
              value={openQuestion}
              onChange={(e) => setOpenQuestion(e.target.value)}
              onBlur={() => {
                setEditingQuestion(false)
                saveOpenQuestion()
              }}
              className="
                w-full
                bg-gray-950
                border border-purple-500
                rounded-lg
                px-3 py-2
                text-sm
                text-white
                focus:outline-none
              "
            />

          )}

        </div>

        {/* sprint stats */}
        <StatGrid stats={stats} />

        {/* concept bubble radar */}
        <ConceptRadar concepts={conceptRadar} />

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
