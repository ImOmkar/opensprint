import { useEffect, useState } from "react"
import { draftService } from "../services/draftService"

function DraftList({ sprintId, version, onSelectDraft }) {

    const [draft, setDraft] = useState(null)
  
    useEffect(() => {
      draftService.load(sprintId).then(setDraft)
    }, [sprintId, version])
  
    if (!draft || !draft.title) return null
  
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-3">Draft</p>
  
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