import { useEffect, useState } from "react"
// import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import LinkedMarkdown from "../components/LinkedMarkdown"

import { useParams, useNavigate } from "react-router-dom"
// import { api } from "../api/client"
import { formatRelativeTime, formatExactTime } from "../utils/time"
import { deepDiveService } from "../services/deepDiveService"
import { sprintService } from "../services/sprintService"
import { userService } from "../services/userService"
import ConfirmModal from "../components/ConfirmModal"
import Spinner from "../components/Spinner"
import MarkdownEditor from "../components/MarkdownEditor"
import { draftService } from "../services/draftService"
import { versionService } from "../services/versionService"
import DiffViewer from "../components/DiffViewer"
import TagInput from "../components/TagInput"

function Section({ title, content }) {

  if (!content) return null

  return (
    <div className="mb-2">

      <h4 className="text-gray-400 font-semibold mb-2">
        {title}
      </h4>

      <div className="prose prose-invert max-w-none text-sm bg-gray-950 border border-gray-800 rounded p-4">

        <LinkedMarkdown content={content} />

      </div>

    </div>
  )
}

function SprintDetail() {
  const { id } = useParams()
  const draftKey = `opensprint_draft_${id}`
  const [lastSaved, setLastSaved] = useState(null)
  const navigate = useNavigate()

  const [user, setUser] = useState(null)

  const [dives, setDives] = useState([])
  const [title, setTitle] = useState("")
  const [problem, setProblem] = useState("")
  const [hypothesis, setHypothesis] = useState("")
  const [tests, setTests] = useState("")
  const [conclusion, setConclusion] = useState("")

  const [sprint, setSprint] = useState(null)
  const [expandedDiveIds, setExpandedDiveIds] = useState(new Set())
  const [editingDiveId, setEditingDiveId] = useState(null)
  const [deleteDiveId, setDeleteDiveId] = useState(null)  

  const [versions, setVersions] = useState([])
  const [showVersionsFor, setShowVersionsFor] = useState(null)

  const [compareVersion, setCompareVersion] = useState(null)

  // const [tags, setTags] = useState("")
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState(null)

  const [loading, setLoading] = useState(true)

  const [isDiveModalOpen, setIsDiveModalOpen] = useState(false)

  const tagCounts = dives.reduce((acc, dive) => {
    if (!dive.tags) return acc
  
    dive.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
  
    return acc
  }, {})

  
  const [selectedDiveId, setSelectedDiveId] = useState(null)
  const selectedDive = dives.find(d => d._id === selectedDiveId)

  useEffect(() => {

    Promise.all([
      userService.getMe(),
      sprintService.getMine(),
      deepDiveService.getBySprint(id)
    ])
      .then(([userData, sprintsData, divesData]) => {
  
        setUser(userData)
  
        const current = sprintsData.find(s => s._id === id)
        setSprint(current)
  
        setDives(divesData)
  
        setLoading(false)

        // auto select first dive
        if (divesData.length > 0)
          setSelectedDiveId(divesData[0]._id)

        setLoading(false)
      })
      .catch(() => navigate("/"))

      draftService.load(id)
      .then(draft => {

        if (!draft) return

        setTitle(draft.title || "")
        setProblem(draft.problem || "")
        setHypothesis(draft.hypothesis || "")
        setTests(draft.tests || "")
        setConclusion(draft.conclusion || "")
        setTags(draft.tags || "")

      })
      
  }, [id])

  useEffect(() => {

    const timeout = setTimeout(() => {
  
      draftService.save({
        sprint_id: id,
        title,
        problem,
        hypothesis,
        tests,
        conclusion,
        tags
      })
  
      setLastSaved(new Date())
  
    }, 800)
  
    return () => clearTimeout(timeout)
  
  }, [title, problem, hypothesis, tests, conclusion, tags, id])

  const loadSprint = () => {
    sprintService.getMine()
      .then(data => {
        const current = data.find(s => s._id === id)
        if (current) setSprint(current)
      })
      .catch(err => console.error(err))
  }
  
  const loadVersions = async (diveId) => {

    const data = await versionService.getVersions(diveId)
  
    setVersions(data)
  
    setShowVersionsFor(diveId)
  
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
      conclusion,
      // tags: tags
      //   .split(",")
      //   .map(tag => tag.trim().replace(/^#/, ""))
      //   .filter(Boolean)
      tags: tags
    }
  
    const newDive = await deepDiveService.create(body)
  
    await draftService.delete(id)
  
    setExpandedDiveIds(prev => new Set([...prev, newDive._id]))

    setDives(prev => [newDive, ...prev])
  
    setSelectedDiveId(newDive._id)   // immediate UI update
  
    setTitle("")
    setProblem("")
    setHypothesis("")
    setTests("")
    setConclusion("")
    setTags("")
  }

  const confirmDeleteDive = async () => {

    await deepDiveService.delete(deleteDiveId)
  
    setDives(prev => prev.filter(d => d._id !== deleteDiveId))
  
    if (selectedDiveId === deleteDiveId)
      setSelectedDiveId(null)
  
    setDeleteDiveId(null)
  }

  const handleEditDive = (dive) => {
    setEditingDiveId(dive._id)
    setTitle(dive.title)
    setProblem(dive.problem)
    setHypothesis(dive.hypothesis)
    setTests(dive.tests)
    setConclusion(dive.conclusion)
    // setTags((dive.tags || []).join(", "))
    setTags(dive.tags || [])
    setIsDiveModalOpen(true)
  }
  
  const handleUpdateDive = async (e) => {
    e.preventDefault()
  
    const body = {
      sprint_id: id,
      title,
      problem,
      hypothesis,
      tests,
      conclusion,
      // tags: tags
      //   .split(",")
      //   .map(tag => tag.trim().replace(/^#/, ""))
      //   .filter(Boolean)
      tags: tags
    }
  
    await deepDiveService.update(editingDiveId, body)
  
    // update locally using existing dive
    setDives(prev =>
      prev.map(d =>
        d._id === editingDiveId
          ? { ...d, ...body }
          : d
      )
    )

    setExpandedDiveIds(prev => new Set([...prev, editingDiveId]))
  
    await draftService.delete(id)
  
    setEditingDiveId(null)
  
    setTitle("")
    setProblem("")
    setHypothesis("")
    setTests("")
    setConclusion("")
    setTags("")
  }

  const handleCopyLink = () => {
    if (!user) return
  
    const link = `${window.location.origin}/u/${user.username}/${id}`
  
    navigator.clipboard.writeText(link)
  
    alert("Public link copied")
  }

  const toggleDive = (id) => {

    const newSet = new Set(expandedDiveIds)
  
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
  
    setExpandedDiveIds(newSet)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Spinner text="Loading sprint..." />
      </div>
    )
  }

  const filteredDives = selectedTag
  ? dives.filter(d => d.tags?.includes(selectedTag))
  : dives

  const resetForm = () => {
    setEditingDiveId(null)
    setTitle("")
    setProblem("")
    setHypothesis("")
    setTests("")
    setConclusion("")
    setTags("")
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* <div className="max-w-6xl mx-auto px-6 py-10">

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
            <div className="
            w-full
            max-w-md
            sm:max-w-none
            bg-gradient-to-br from-gray-900 to-gray-950
            p-5 sm:p-6 lg:p-8
            rounded-xl border border-gray-800 shadow-lg
          ">

              <div className="
                flex flex-col sm:flex-row
                sm:justify-between sm:items-start
                gap-4 sm:gap-6
              ">

                <div className="flex-1 min-w-0">

                  <div className="
                    flex flex-col sm:flex-row
                    sm:items-center
                    gap-2 sm:gap-3
                    mb-2
                  ">

                    <h1 className="
                      text-xl sm:text-2xl lg:text-3xl
                      font-bold text-green-400
                      break-words
                    ">
                      {sprint.title}
                    </h1>

                    {sprint.status === "completed" && (
                      <span className="
                        text-xs
                        bg-blue-500 text-black
                        px-2 py-1 rounded
                        w-fit
                      ">
                        Completed
                      </span>
                    )}

                  </div>

                  <p className="
                    text-sm sm:text-base
                    text-gray-400 mb-2
                    break-words
                  ">
                    {sprint.goal}
                  </p>

                  {sprint.description && (
                    <p className="
                      text-sm sm:text-base
                      text-gray-500 whitespace-pre-wrap
                      break-words
                    ">
                      {sprint.description}
                    </p>
                  )}

                  <div className="
                    mt-3 sm:mt-4
                    text-xs text-gray-500
                    space-y-1
                  ">

                    <p title={formatExactTime(sprint.created_at)}>
                      Created {formatRelativeTime(sprint.created_at)}
                    </p>

                    {sprint.completed_at && (
                      <p
                        className="text-blue-400"
                        title={formatExactTime(sprint.completed_at)}
                      >
                        Completed {formatRelativeTime(sprint.completed_at)}
                      </p>
                    )}

                  </div>

                </div>

                {user && (
                  <button
                    onClick={handleCopyLink}
                    className="
                      w-full sm:w-auto
                      bg-green-500 hover:bg-green-400
                      text-black
                      px-4 sm:px-5
                      py-2
                      rounded-lg
                      font-semibold
                      transition
                      text-sm sm:text-base
                    "
                  >
                    Copy Public Link
                  </button>
                )}

              </div>

            </div>
          )}

        </div>

        {Object.keys(tagCounts).length > 0 && (
          <div className="mb-6">

            <p className="text-sm text-gray-400 mb-2">
              Tags in this sprint
            </p>

            <div className="flex flex-wrap gap-2">

              {Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(([tag, count]) => (

                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`text-xs border px-2 py-1 rounded-md transition flex items-center gap-1
                    ${
                      selectedTag === tag
                        ? "bg-purple-500 text-black border-purple-500"
                        : "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/40"
                    }`}
                >
                  <span>#{tag}</span>
                  <span className="text-gray-400">
                    ({count})
                  </span>
                </button>

              ))}

            </div>

          </div>
        )}

        {sprint?.status === "completed" && (

          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">

            <p className="text-blue-400 font-medium">
              This sprint is completed.
            </p>

            <p className="text-blue-300 text-sm mt-1">
              Deep dives are now locked and this sprint is read-only.
            </p>

          </div>

        )}

        {selectedTag && (
          <div className="mb-4 flex items-center gap-3">

            <span className="text-sm text-gray-400">
              Filtering by
            </span>

            <span
              className="text-xs bg-purple-500 text-black border border-purple-500 px-2 py-1 rounded-md"
            >
              #{selectedTag}
            </span>

            <button
              onClick={() => setSelectedTag(null)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Clear
            </button>

          </div>
        )}

        <div className="flex justify-between items-center mb-6 mt-8">

          <h2 className="text-lg font-semibold text-gray-300">
            Deep Dives
          </h2>

          {sprint?.status === "active" && (

            <button
              onClick={() => {
                setEditingDiveId(null)
                setTitle("")
                setProblem("")
                setHypothesis("")
                setTests("")
                setConclusion("")
                setTags("")
                setIsDiveModalOpen(true)
              }}
              className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-xl font-medium transition"
            >
              + Add Deep Dive
            </button>

          )}

        </div>

        <div className="space-y-4">
          {dives.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">

              <h3 className="text-lg font-semibold text-green-400 mb-2">
                No deep dives yet
              </h3>

              <p className="text-gray-400 mb-3">
                Log your first investigation, debugging session, or discovery.
              </p>

              <p className="text-gray-500 text-sm">
                Every deep dive builds your engineering journal.
              </p>

            </div>
          )}

          {dives
            .filter(dive =>
              selectedTag ? dive.tags?.includes(selectedTag) : true
            )
            .map(dive => (

              <div
                key={dive._id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition"
              >

                <div className="flex justify-between items-start mb-4">

                  <div>

                    <button
                      onClick={() => toggleDive(dive._id)}
                      className="text-left w-full">

                      <div className="flex items-center gap-3">

                        <span className="text-purple-400 text-sm">
                          {expandedDiveIds.has(dive._id) ? "▼" : "▶"}
                        </span>

                        <h3 className="text-xl font-semibold text-green-400 hover:text-green-300 transition">
                          {dive.title}
                        </h3>

                      </div>

                    </button>

                    <button
                      onClick={() => loadVersions(dive._id)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      History
                    </button>

                    {dive.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {dive.tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`text-xs border px-2 py-1 rounded-md transition
                              ${
                                selectedTag === tag
                                  ? "bg-purple-500 text-black border-purple-500"
                                  : "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/40"
                              }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}

                    <p
                      className="text-xs text-gray-500"
                      title={formatExactTime(dive.created_at)}
                    >
                      Logged {formatRelativeTime(dive.created_at)}
                    </p>

                  </div>

                  {sprint.status === "active" && (
                    <div className="flex gap-4 text-sm">

                      <button
                        onClick={() => handleEditDive(dive)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteDiveId(dive._id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>

                    </div>
                  )}

                </div>

                <div
                    className={`transition-all duration-300 overflow-hidden ${
                      expandedDiveIds.has(dive._id)
                        ? "max-h-[2000px] opacity-100 mt-4"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                  {expandedDiveIds.has(dive._id) && (

                    <div className="mt-4 border-t border-gray-800 pt-4">

                      <Section title="Problem" content={dive.problem} />

                      <Section title="Hypothesis" content={dive.hypothesis} />

                      <Section title="Tests" content={dive.tests} />

                      <Section title="Conclusion" content={dive.conclusion} />

                    </div>

                  )}
                </div>

                {showVersionsFor === dive._id && versions.length > 0 && (

                  <div className="mt-6 border-t border-gray-800 pt-4">
                  

                    <p className="text-sm text-gray-400 mb-3">
                      Version History
                    </p>

                    {versions.map(version => (

                      <div
                        key={version._id}
                        className="bg-gray-950 border border-gray-800 rounded p-3 mb-3">
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {

                              if (confirm("Restore this version? Current version will be saved.")) {

                                await versionService.restore(dive._id, version._id)
                              
                                loadDives()

                                
                                setShowVersionsFor(null)
                              
                              }

                            }}
                            className="text-green-400 hover:text-green-300 text-xs">
                            Restore this version
                          </button>

                          <button
                            onClick={() => setCompareVersion(version)}
                            className="text-purple-400 hover:text-purple-300 text-xs"
                          >
                            Compare with current
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 mb-2">
                          {formatRelativeTime(version.versioned_at)}
                        </p>

                        <Section title="Problem" content={version.problem} />

                        <Section title="Conclusion" content={version.conclusion} />

                      </div>

                    ))}

                    {compareVersion && showVersionsFor === dive._id && (

                      <div className="mt-4">

                        <p className="text-sm text-purple-400 mb-2">
                          Changes compared to current version
                        </p>

                        <DiffViewer
                          oldText={compareVersion.problem}
                          newText={dive.problem}
                        />

                      </div>

                    )}
                  </div>

                )}

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
      </div> */}


      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

      <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-green-400 hover:underline"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-4">

            {/* Sprint Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">

              <h1 className="text-xl font-bold text-green-400 mb-2">
                {sprint.title}
              </h1>

              <p className="text-gray-400 text-sm mb-3">
                {sprint.goal}
              </p>

              <button
                onClick={handleCopyLink}
                className="w-full bg-green-500 hover:bg-green-400 text-black py-2 rounded font-medium"
              >
                Copy Public Link
              </button>

            </div>


            {/* Tags */}
            {Object.keys(tagCounts).length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400 mb-3">
                    Tags
                  </p>
                  {selectedTag && (
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="text-xs text-red-400 mt-2"
                    >
                      Clear filter
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(tagCounts).map(([tag, count]) => (

                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(tag)
                      
                        const first = dives.find(d => d.tags?.includes(tag))
                        if (first) setSelectedDiveId(first._id)
                      }}
                      className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded"
                    >
                      #{tag} ({count})
                    </button>

                  ))}
                  
                </div>

              </div>
            )}


            {/* Dive List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl">

              <div className="flex justify-between items-center p-4 border-b border-gray-800">

                <p className="text-sm text-gray-400">
                  Deep Dives
                </p>

                {sprint.status === "active" && (
                  <button
                    onClick={() => {
                      setEditingDiveId(null)
                      setSelectedDiveId(null)
                      resetForm()
                      setIsDiveModalOpen(true)
                    }}
                    className="text-green-400 text-sm hover:text-green-300"
                  >
                    + New
                  </button>
                )}

              </div>

              <div className="max-h-[500px] overflow-y-auto">

                {filteredDives.map(dive => (

                  <button
                    key={dive._id}
                    onClick={() => setSelectedDiveId(dive._id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition
                    ${selectedDiveId === dive._id ? "bg-gray-800" : ""}`}
                  >

                    <p className="text-green-400 text-sm font-medium">
                      {dive.title}
                    </p>

                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(dive.created_at)}
                    </p>

                  </button>

                ))}

              </div>

            </div>

          </div>



          {/* RIGHT CONTENT */}
          <div className="lg:col-span-2">

            {!selectedDive && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">

                <p className="text-gray-400">
                  Select a deep dive to view
                </p>

              </div>
            )}


            {selectedDive && (

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

                {/* Header */}

                <div className="flex justify-between items-center mb-6">

                  <h2 className="text-xl font-semibold text-green-400">
                    {selectedDive.title}
                  </h2>

                  <div className="flex items-center gap-2">
                    {sprint.status === "active" && (
                      <>
                        <button
                          onClick={() => handleEditDive(selectedDive)}
                          className="text-yellow-400 hover:text-yellow-300 text-sm hover:underline hover:underline-4"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => setDeleteDiveId(selectedDive._id)}
                          className="text-red-500 hover:text-red-400 hover:underline hover:underline-4"
                          >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                </div>


                {/* Sections */}

                <Section title="Problem" content={selectedDive.problem} />
                <Section title="Hypothesis" content={selectedDive.hypothesis} />
                <Section title="Tests" content={selectedDive.tests} />
                <Section title="Conclusion" content={selectedDive.conclusion} />

              </div>

            )}

          </div>

        </div>


      </div>

      <DeepDiveModal
        isOpen={isDiveModalOpen}
        onClose={() => setIsDiveModalOpen(false)}
        editingDiveId={editingDiveId}
        title={title}
        setTitle={setTitle}
        problem={problem}
        setProblem={setProblem}
        hypothesis={hypothesis}
        setHypothesis={setHypothesis}
        tests={tests}
        setTests={setTests}
        conclusion={conclusion}
        setConclusion={setConclusion}
        tags={tags}
        setTags={setTags}
        lastSaved={lastSaved}
        onSubmit={editingDiveId ? handleUpdateDive : handleCreateDive}
      />

      
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


function DeepDiveModal({
  isOpen,
  onClose,
  editingDiveId,
  title,
  setTitle,
  problem,
  setProblem,
  hypothesis,
  setHypothesis,
  tests,
  setTests,
  conclusion,
  setConclusion,
  tags,
  setTags,
  lastSaved,
  onSubmit
}) {

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50
      bg-black/80 backdrop-blur-sm
      flex items-center justify-center
      p-4">

      <div className="w-full max-w-5xl
        max-h-[95vh]
        overflow-y-auto
        bg-gradient-to-b from-gray-900 to-gray-950
        border border-gray-800
        rounded-xl
        shadow-2xl">

        <div className="flex items-center justify-between
          px-6 py-4
          border-b border-gray-800">

          <h2 className="text-lg font-semibold text-green-400">
            {editingDiveId ? "Edit Deep Dive" : "New Deep Dive"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white
            text-xl px-2 py-1 rounded
            hover:bg-gray-800
            transition"
          >
            ×
          </button>

        </div>  

        <form
          className=""
          onSubmit={async (e) => {
              await onSubmit(e)
              onClose()
          }}
          >
          
          <div className="px-2  flex flex-col gap-4">
            <input
              type="text"
              placeholder="Deep Dive Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full
              text-xl font-semibold
              bg-transparent
              border-none
              outline-none
              text-white
              placeholder-gray-500
              pt-3"
              required
            />

            {/* <input
              type="text"
              placeholder="Tags (debugging, dns, linux)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full
              text-sm
              bg-gray-900
              border border-gray-800
              rounded-lg
              px-3 py-2
              focus:border-purple-500
              outline-none"
            /> */}

            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="debugging, dns, linux"
            />

            <MarkdownEditor label="Problem" value={problem} onChange={setProblem} />
            <MarkdownEditor label="Hypothesis" value={hypothesis} onChange={setHypothesis} />
            <MarkdownEditor label="Tests" value={tests} onChange={setTests} />
            <MarkdownEditor label="Conclusion" value={conclusion} onChange={setConclusion} />
          </div>

          <div className="
            flex items-center justify-between
            px-6 py-4
            border-t border-gray-800
            bg-gray-950
            ">

            <div className="text-xs text-gray-500">
              {lastSaved && `Draft saved ${formatRelativeTime(lastSaved)}`}
            </div>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={onClose}
                className="
                  px-4 py-2 rounded-lg
                  border border-gray-700
                  hover:border-gray-500
                  text-gray-300
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                className="
                  px-5 py-2 rounded-lg
                  bg-green-500 hover:bg-green-400
                  text-black font-medium
                "
              >
                {editingDiveId ? "Update Dive" : "Save Dive"}
              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  )
}


function EditorSection({ label, value, onChange }) {

  return (
    <div className="px-6  border-t border-gray-800">

      <h3 className="text-sm text-gray-400 mb-3">
        {label}
      </h3>

      <MarkdownEditor
        label="Problem"
        value={value}
        onChange={onChange}
        compact={false}
      />

    </div>
  )
}