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
import DashboardLayout from "../components/DashboardLayout"
import DraftList from "../components/DraftList"
import { aiService } from "../services/aiService"
import toast from "react-hot-toast"
import ShareModal from "../components/ShareModal"

import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import SprintReport from "../components/SprintReport"

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

  const [backlinks, setBacklinks] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [draftVersion, setDraftVersion] = useState(0)

  const [shareOpen, setShareOpen] = useState(false)

  const tagCounts = dives.reduce((acc, dive) => {
    if (!dive.tags) return acc

    dive.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })

    return acc
  }, {})


  const [selectedDiveId, setSelectedDiveId] = useState(null)
  const selectedDive = dives.find(d => d._id === selectedDiveId)

  const [aiSummary, setAiSummary] = useState("")
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)

  const hasDraftContent =
    !!title || !!problem || !!hypothesis || !!tests || !!conclusion || tags.length > 0

  const [showDraftNotice, setShowDraftNotice] = useState(false)

  const [unexploredConcepts, setUnexploredConcepts] = useState([])

  const [expandingConcept, setExpandingConcept] = useState(null)

  const [relatedDives, setRelatedDives] = useState()

  const [conceptRadar, setConceptRadar] = useState()

  const [suggestedConcepts, setSuggestedConcepts] = useState()

  const [timelineDives, setTimelineDives] = useState([])
  

  const handleDownloadReport = async () => {

    const element = document.getElementById("sprint-report")
    if (!element) return
  
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true
    })
  
    const imgData = canvas.toDataURL("image/png")
  
    const pdf = new jsPDF("p", "mm", "a4")
  
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
  
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
    pdf.save(`${sprint.title}-report.pdf`)
  }

  const handleGenerateSummary = async () => {
    setSummaryOpen(true)
    setLoadingSummary(true)
    try {
      const summary = await aiService.generateSummary(id)
      toast.success("Summary is ready")
      setAiSummary(summary)
      setLoadingSummary(false)
    } catch (err) {
      toast.error("Failed to generate summary")
    }
  }

  const handleModalClose = () => {
    if (isSubmitting) {
      setIsDiveModalOpen(false)
      return
    }

    if (hasDraftContent && !editingDiveId) {
      setShowDraftNotice(true)
    } else {
      setIsDiveModalOpen(false)
    }
  }

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
        // setTags(draft.tags || "")
        setTags(draft.tags || [])

      })

    deepDiveService.getSprintTimeline(id)
      .then(setTimelineDives)
      .catch(() => setTimelineDives([]))

  }, [id])

  useEffect(() => {
    if (!selectedDiveId) return

    deepDiveService.getBacklinks(selectedDiveId)
      .then(setBacklinks)
      .catch(() => setBacklinks([]))

    deepDiveService.getRelated(selectedDiveId)
      .then(setRelatedDives)
      .catch(() => setRelatedDives([]))

    deepDiveService.getConceptRadar(id)
      .then(setConceptRadar)
      .catch(() => setConceptRadar([]))

    aiService.expandConcept(selectedDive.title)
      .then(res => setSuggestedConcepts(res.concepts || []))
      .catch(() => setSuggestedConcepts([]))

  }, [selectedDiveId])

  useEffect(() => {

    if (!isDiveModalOpen || editingDiveId) return

    const timeout = setTimeout(async () => {

      await draftService.save({
        sprint_id: id,
        title,
        problem,
        hypothesis,
        tests,
        conclusion,
        tags
      })

      setLastSaved(new Date())
      setDraftVersion(prev => prev + 1)

    }, 800)

    return () => clearTimeout(timeout)

  }, [title, problem, hypothesis, tests, conclusion, tags, id, isDiveModalOpen])

  console.log("suggested concepts", suggestedConcepts)

  // useEffect(() => {

  //   if (dives.length === 0) return
  
  //   const unexplored = getUnexploredConcepts()
  
  //   setUnexploredConcepts(unexplored)
  
  // }, [dives])

  useEffect(() => {

    const unexplored = getUnexploredConcepts()
    setUnexploredConcepts(unexplored)
  
  }, [dives])

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

  function extractLinks(text) {
    if (!text) return []
  
    const matches = [...text.matchAll(/\[\[(.*?)\]\]/g)]
    return matches.map(m => m[1].trim())
  }

  const loadDives = () => {
    deepDiveService.getBySprint(id)
      .then(data => setDives(data))
      .catch(() => navigate("/"))
  }

  // const getUnexploredConcepts = () => {

  //   const allLinks = new Set()
  //   const diveTitles = new Set()
  
  //   dives.forEach(dive => {
  
  //     diveTitles.add(dive.title)
  
  //     const texts = [
  //       dive.problem,
  //       dive.hypothesis,
  //       dive.tests,
  //       dive.conclusion
  //     ]
  
  //     texts.forEach(t => {
  //       extractLinks(t).forEach(link => {
  //         allLinks.add(link)
  //       })
  //     })
  
  //   })
  
  //   const unexplored = [...allLinks].filter(
  //     link => !diveTitles.has(link)
  //   )
  
  //   return unexplored
  // }

  function getUnexploredConcepts() {

    const allLinks = new Set()
    const diveTitles = new Set()
  
    dives.forEach(dive => {
  
      diveTitles.add(dive.title.toLowerCase())
  
      const texts = [
        dive.problem,
        dive.hypothesis,
        dive.tests,
        dive.conclusion
      ]
  
      texts.forEach(t => {
        extractLinks(t).forEach(link => {
          allLinks.add(link)
        })
      })
  
    })
  
    const unexplored = [...allLinks].filter(
      link => !diveTitles.has(link.toLowerCase())
    )
  
    return unexplored
  }

  const handleCreateDive = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

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

    try {
      const newDive = await deepDiveService.create(body)
      await draftService.delete(id)
      setDraftVersion(prev => prev + 1)
      setExpandedDiveIds(prev => new Set([...prev, newDive._id]))
      setDives(prev => [newDive, ...prev])
      setSelectedDiveId(newDive._id)   // immediate UI update
      setTitle("")
      setProblem("")
      setHypothesis("")
      setTests("")
      setConclusion("")
      setTags([])
      resetForm()
      setIsSubmitting(false)
      setIsDiveModalOpen(false)
      toast.success("A new dive created successfully")
    } catch (err) {
      toast.error("Failed to create a new dive")
    }
  }

  const confirmDeleteDive = async () => {
    try {
      await deepDiveService.delete(deleteDiveId)

      setDives(prev => prev.filter(d => d._id !== deleteDiveId))

      if (selectedDiveId === deleteDiveId)
        setSelectedDiveId(null)

      setDeleteDiveId(null)
      toast.success("Dive deleted successfully")
    } catch (err) {
      toast.error("Failed to delete a dive")
    }
  }

  // const handleCreateFromConcept = (concept) => {

  //   setEditingDiveId(null)
  //   setSelectedDiveId(null)
  
  //   setTitle(concept)
  //   setProblem("")
  //   setHypothesis("")
  //   setTests("")
  //   setConclusion("")
  //   setTags([])
  
  //   setIsDiveModalOpen(true)
  // }

  const handleCreateFromConcept = async (concept) => {
    setExpandingConcept(concept)
    try {
      
      const result = await aiService.expandConcept(concept)
      setEditingDiveId(null)
      setSelectedDiveId(null)
      setTitle(concept)
      setProblem(result.problem || "")
      setHypothesis(result.hypothesis || "")
      setTests(result.tests || "")
      setConclusion(result.conclusion || "test")
      setTags([])
      setIsDiveModalOpen(true)
    } catch (err) {
      toast.error("Failed to expand concept")
    }
    setExpandingConcept(null)
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
    setIsSubmitting(true)

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

    try {
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
      setTags([])
      setIsSubmitting(false)
      setIsDiveModalOpen(false)

      toast.success("Dive updated successfully")
    } catch (err) {
      toast.error("Failed to update a dive")
    }
  }

  const handleCopyLink = () => {
    if (!user) return

    const link = `${window.location.origin}/u/${user.username}/${id}`

    navigator.clipboard.writeText(link)

    // alert("Public link copied")
    toast.success("Public link copied")
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
    setTags([])
  }

  console.log("unexplored concepts", unexploredConcepts)

  return (
    // <div className="min-h-screen bg-black text-white">
    <DashboardLayout user={user}>

      <div className="px-4 sm:px-6 py-6">

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-green-400 hover:underline hover:underline-offset-4"
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

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch gap-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full sm:flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-black rounded-lg text-sm"
                >
                  Copy Public Link
                </button>

                <button
                  onClick={handleGenerateSummary}
                  className="w-full sm:flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
                >
                  {loadingSummary ? "Generating..." : "✨ AI Summary"}
                </button>

                <button
                  onClick={handleDownloadReport}
                  className="w-full sm:basis-full px-4 py-2 bg-white text-black rounded-lg text-sm hover:bg-gray-200"
                >
                  Download Report
                </button>
              </div>

            </div>

            {/* timeline */}
            {timelineDives?.length > 0 && (
              <div className="
                bg-gray-900
                border border-gray-800
                rounded-xl
                p-4
              ">

                <p className="text-sm text-gray-400 mb-3">
                  Sprint Timeline
                </p>

                <div className="space-y-2">

                  {timelineDives?.map(d => (

                    <div
                      key={d._id}
                      className="flex items-center gap-3 text-sm"
                    >

                      <span className="text-gray-500 text-xs w-20">
                        {new Date(d.created_at).toLocaleDateString()}
                      </span>

                      <button
                        onClick={() => setSelectedDiveId(d._id)}
                        className="text-green-400 hover:underline"
                      >
                        {d.title}
                      </button>

                    </div>

                  ))}

                </div>

              </div>
            )}

            {/* draft list */}
            <DraftList
              sprintId={id}
              version={draftVersion}
              onSelectDraft={(draft) => {
                setTitle(draft.title)
                setProblem(draft.problem)
                setHypothesis(draft.hypothesis)
                setTests(draft.tests)
                setConclusion(draft.conclusion)
                setTags(draft.tags || [])
                setEditingDiveId(null)
                setIsDiveModalOpen(true)
              }}
            />
            
            {/* Concept radar section */}
            {conceptRadar?.length > 0 && (
              <div className="
                bg-gray-900
                border border-gray-800
                rounded-xl
                p-4">

                <p className="text-sm text-gray-400 mb-3">
                  Concept Radar
                </p>

                <div className="space-y-2">

                  {conceptRadar?.slice(0,5).map(c => (

                    <div
                      key={c.concept}
                      className="flex items-center justify-between text-sm"
                    >

                      <span className="text-purple-300">
                        {c.concept}
                      </span>

                      <div className="flex items-center gap-2">

                        <div className="w-24 bg-gray-800 h-2 rounded">

                          <div
                            className="bg-purple-500 h-2 rounded"
                            style={{
                              width: `${c.count * 20}%`
                            }}
                          />

                        </div>

                        <span className="text-gray-500 text-xs">
                          {c.count}
                        </span>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            )}

            {/* Tags section */}
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

            {/* unexplored concepts section */}
            {unexploredConcepts.length > 0 && (
              <div
                className="
                  mb-6
                  bg-gray-900/60
                  border border-gray-800
                  rounded-xl
                  p-5
                "
              >

                <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">
                  Unexplored Concepts
                </p>

                <div className="flex flex-wrap gap-2">

                  {/* {unexploredConcepts.map((concept, index) => (
                    <button
                      key={index}
                      className="
                        px-3 py-1
                        text-sm
                        bg-yellow-500/10
                        text-yellow-300
                        border border-yellow-500/20
                        rounded-full
                      "
                    >
                      {concept}
                    </button>
                  ))} */}

                  {unexploredConcepts.map((concept, index) => (
                    <button
                      key={index}
                      onClick={() => handleCreateFromConcept(concept)}
                      className="
                        px-3 py-1
                        text-sm
                        bg-yellow-500/10
                        text-yellow-300
                        border border-yellow-500/20
                        rounded-full
                        hover:bg-yellow-500/20
                        transition
                      ">
                      {/* {expandingConcept === concept ? "Expanding..." : concept} */}
                      {expandingConcept === concept ? (
                        <>
                          ⏳ Expanding...
                        </>
                      ) : (
                        <>
                          {concept}
                          <span className="text-yellow-400 text-xs opacity-70">
                             ✨
                          </span>
                        </>
                      )}
                    </button>
                  ))}

                </div>

              </div>
            )}

            {/* Dive List section */}
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
                    className="text-green-400 text-sm hover:text-green-300 hover:underline hover:underline-offset-4"
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

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-green-400 text-sm font-medium">
                          {dive.title}
                        </p>

                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(dive.created_at)}
                        </p>
                      </div>

                      <div>
                        <button
                          onClick={() => setShareOpen(true)}
                          className="text-purple-400 hover:text-purple-300 text-sm hover:underline hover:underline-offset-4"
                        >
                          Share
                        </button>
                      </div>
                    </div>

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
                          className="text-yellow-400 hover:text-yellow-300 text-sm hover:underline hover:underline-offset-4"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => setDeleteDiveId(selectedDive._id)}
                          className="text-red-500 hover:text-red-400 hover:underline hover:underline-offset-4"
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
                
                {/* backlinks section */}
                {backlinks?.length > 0 && (

                  <div className="mt-8 border-t border-gray-800 pt-4">

                    <h4 className="text-sm font-semibold text-purple-400 mb-3">
                      Referenced in
                    </h4>

                    <div className="space-y-2">

                      {backlinks.map(d => (

                        <button
                          key={d._id}
                          onClick={() => setSelectedDiveId(d._id)}
                          className="
                            block text-left w-full
                            text-sm text-green-400
                            hover:underline hover:underline-offset-4
                          "
                        >
                          {d.title}
                        </button>

                      ))}

                    </div>

                  </div>

                )}

                {/* relateddives section */}
                {relatedDives?.length > 0 && (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <h4 className="text-sm font-semibold text-purple-400 mb-3">
                      Related Dives
                    </h4>
                    <div className="space-y-2">
                      {relatedDives?.map(d => (
                        <button
                          key={d?._id}
                          onClick={() => setSelectedDiveId(d._id)}
                          className="
                            block text-left w-full
                            text-sm text-green-400
                            hover:underline hover:underline-offset-4
                          ">
                          {d?.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* suggested concepts via AI */}
                {suggestedConcepts?.length > 0 && (

                <div className="mt-8 border-t border-gray-800 pt-4">

                  <h4 className="text-sm font-semibold text-purple-400 mb-3">
                    Suggested Next Concepts
                  </h4>

                  <div className="flex flex-wrap gap-2">

                    {suggestedConcepts?.map((concept, i) => (

                      <button
                        key={i}
                        onClick={() => handleCreateFromConcept(concept)}
                        className="
                          px-3 py-1
                          text-sm
                          bg-purple-500/10
                          text-purple-300
                          border border-purple-500/20
                          rounded-full
                          hover:bg-purple-500/20
                        "
                      >
                        {concept}
                      </button>

                    ))}

                  </div>

                </div>

                )}

              </div>

            )}

          </div>

        </div>

      </div>

      <DeepDiveModal
        isOpen={isDiveModalOpen}
        // onClose={() => setIsDiveModalOpen(false)}
        onClose={handleModalClose}
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

      <ConfirmModal
        isOpen={showDraftNotice}
        title="Saved as Draft"
        message="This deep dive has been saved as a draft. You can resume it later."
        confirmText="Close"
        cancelText="Continue Editing"
        onConfirm={() => {
          setShowDraftNotice(false)
          setIsDiveModalOpen(false)
        }}
        onCancel={() => setShowDraftNotice(false)}
      />

      {/* AI Summary sideover panel */}
      {summaryOpen && (
        <div className="fixed inset-0 z-50 flex">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSummaryOpen(false)}
          />

          {/* Panel */}
          <div className="
            relative ml-auto
            w-full sm:w-[450px] md:w-[500px]
            h-full
            bg-gray-950 border-l border-gray-800
            shadow-2xl
            flex flex-col
            animate-slideIn
          ">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-purple-400 font-semibold">
                AI Sprint Summary
              </h3>

              <button
                onClick={() => setSummaryOpen(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">

              {loadingSummary && (
                <div className="text-gray-400 text-sm">
                  Generating summary...
                </div>
              )}

              {!loadingSummary && aiSummary && (
                <div className="prose prose-invert max-w-none text-sm">
                  <LinkedMarkdown content={aiSummary} />
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={selectedDive?.title}
        problem={selectedDive?.problem}
        username={user?.username}
        streak={0}
        publicUrl={`${window.location.origin}/d/${selectedDive?._id}`}
      />

      <div style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999pdx"
      }}>
        <SprintReport
          sprint={sprint} dives={dives} username={user?.username} streak={0}>
        </SprintReport>
      </div>

      {/* </div> */}
    </DashboardLayout>
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

  const [improvingField, setImprovingField] = useState(null)
  const [suggestingTags, setSuggestingTags] = useState(false)

  const handleSuggestTags = async () => {

    const combined = `
      ${title}
      ${problem}
      ${hypothesis}
      ${tests}
      ${conclusion}
    `

    if (!combined.trim()) return

    setSuggestingTags(true)

    try {
      const newTags = await aiService.suggestTags(combined)

      const merged = Array.from(new Set([...tags, ...newTags]))
      setTags(merged)

    } catch (err) {
      console.error(err)
    }

    setSuggestingTags(false)
  }


  const handleImprove = async (fieldName, value, setter) => {
    if (!value?.trim()) return

    setImprovingField(fieldName)

    try {
      const improved = await aiService.improve(value, fieldName)
      setter(improved)
    } catch (err) {
      console.error(err)
    }

    setImprovingField(null)
  }

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

        <form onSubmit={onSubmit}>

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

            <TagInput
              value={tags}
              onChange={setTags}
              onSuggest={handleSuggestTags}
              suggesting={suggestingTags}
              placeholder="debugging, dns, linux"
            />

            <MarkdownEditor label="Problem" value={problem} onChange={setProblem} onImprove={() => handleImprove("problem", problem, setProblem)} improving={improvingField === "problem"} />
            <MarkdownEditor label="Hypothesis" value={hypothesis} onChange={setHypothesis} onImprove={() => handleImprove("hypothesis", hypothesis, setHypothesis)} improving={improvingField === "hypothesis"} />
            <MarkdownEditor label="Tests" value={tests} onChange={setTests} onImprove={() => handleImprove("tests", tests, setTests)} improving={improvingField === "tests"} />
            <MarkdownEditor label="Conclusion" value={conclusion} onChange={setConclusion} onImprove={() => handleImprove("conclusion", conclusion, setConclusion)} improving={improvingField === "conclusion"} />
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