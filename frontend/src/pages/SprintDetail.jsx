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

function Section({ title, content }) {

  if (!content) return null

  return (
    <div className="mb-6">

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

  const [tags, setTags] = useState("")
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
      tags: tags
        .split(",")
        .map(tag => tag.trim().replace(/^#/, ""))
        .filter(Boolean)
    }
  
    const newDive = await deepDiveService.create(body)
  
    await draftService.delete(id)
  
    setExpandedDiveIds(prev => new Set([...prev, newDive._id]))
  
    setDives(prev => [newDive, ...prev])   // immediate UI update
  
    setTitle("")
    setProblem("")
    setHypothesis("")
    setTests("")
    setConclusion("")
    setTags("")
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
    setTags((dive.tags || []).join(", "))
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
      tags: tags
        .split(",")
        .map(tag => tag.trim().replace(/^#/, ""))
        .filter(Boolean)
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
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

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

                {sprint.description && (
                  <p className="text-gray-500 mt-3 whitespace-pre-wrap">
                    {sprint.description}
                  </p>
                )}

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

        <div className="flex justify-between items-center mb-6">

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
              className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded font-medium transition"
            >
              + Add Deep Dive
            </button>

          )}

        </div>

        {/* Deep Dive List */}
        <div className="space-y-4">
          {dives.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded p-8 text-center">

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

                {/* Header */}
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

                    {/* Tags */}
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

                    {/* Timestamp */}
                    <p
                      className="text-xs text-gray-500"
                      title={formatExactTime(dive.created_at)}
                    >
                      Logged {formatRelativeTime(dive.created_at)}
                    </p>

                  </div>

                  {/* Actions */}
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-lg font-semibold text-green-400">
            {editingDiveId ? "Edit Deep Dive" : "New Deep Dive"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>

        </div>

        {lastSaved && (
          <p className="text-xs text-gray-500 mb-4">
            Draft saved {formatRelativeTime(lastSaved)}
          </p>
        )}

        <form
          onSubmit={async (e) => {
            await onSubmit(e)
            onClose()
          }}
        >

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-black border border-gray-700 focus:border-green-500 outline-none"
            required
          />

          <input
            type="text"
            placeholder="Tags (debugging, dns, linux)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full mb-6 p-3 rounded bg-black border border-gray-700 focus:border-purple-500 outline-none"
          />

          <MarkdownEditor label="Problem" value={problem} onChange={setProblem} />

          <MarkdownEditor label="Hypothesis" value={hypothesis} onChange={setHypothesis} />

          <MarkdownEditor label="Tests" value={tests} onChange={setTests} />

          <MarkdownEditor label="Conclusion" value={conclusion} onChange={setConclusion} />

          <div className="flex justify-end gap-3 mt-6">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 rounded text-gray-300 hover:border-gray-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-400 text-black px-5 py-2 rounded font-medium"
            >
              {editingDiveId ? "Update" : "Save"}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}