import { formatRelativeTime, formatExactTime } from "../utils/time"
import { useNavigate } from "react-router-dom"

function SprintCard({ sprint, onEdit, onDelete, onToggle }) {

  const navigate = useNavigate()

  return (

    <div className="
      bg-gray-900
      border border-gray-800
      hover:border-green-500
      rounded-xl
      p-5
      transition
    ">

      <div className="flex justify-between items-start">

        <div
          onClick={() => navigate(`/sprint/${sprint._id}`)}
          className="cursor-pointer"
        >

          <h3 className="text-lg font-semibold text-green-400">
            {sprint.title}
          </h3>

          <p className="text-gray-400 text-sm">
            {sprint.goal}
          </p>

          <p
            className="text-xs text-gray-500 mt-2"
            title={formatExactTime(sprint.created_at)}
          >
            Created {formatRelativeTime(sprint.created_at)}
          </p>

        </div>

        <div className="flex gap-3 text-sm">

          <button
            onClick={() => onToggle(sprint._id)}
            className="text-blue-400 hover:underline hover:underline-offset-4"
          >
            {sprint.status === "completed" ? "Reopen" : "Complete"}
          </button>

          <button
            onClick={() => onEdit(sprint)}
            className="text-yellow-400 hover:underline hover:underline-offset-4"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(sprint._id)}
            className="text-red-400 hover:underline hover:underline-offset-4"
          >
            Delete
          </button>

        </div>

      </div>

    </div>

  )
}

export default SprintCard