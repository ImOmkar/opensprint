import { useEffect, useState } from "react"
import { draftService } from "../services/draftService"
import toast from "react-hot-toast"

function DraftList({ sprintId, version, onSelectDraft }) {

  const [draft, setDraft] = useState(null)

  useEffect(() => {
    draftService.load(sprintId).then(setDraft)
  }, [sprintId, version])

  const handleDeleteDraft = async () => {
    try{
      await draftService.delete(sprintId)
      setDraft(null)
      toast.success("Draft deleted")
    } catch {
      toast.error("Failed to delete draft")
    }
  }

  if (!draft || !draft.title) return null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      {/* <p className="text-sm text-gray-400 mb-3">Draft</p> */}

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">Draft</p>

        <button
          onClick={handleDeleteDraft}
          className="text-xs text-red-400 hover:text-red-300 hover:underline"
        >
          Delete
        </button>
      </div>

      <button
        onClick={() => onSelectDraft(draft)}
        className="w-full text-left text-yellow-400 hover:underline"
      >
        {draft.title || "Untitled draft"}
      </button>
    </div>
  )
}

export default DraftList