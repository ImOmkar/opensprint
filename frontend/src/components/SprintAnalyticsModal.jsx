import { useEffect, useState } from "react"
import { analyticsService } from "../services/analyticsService"

function SprintAnalyticsModal({ sprintId, isOpen, onClose }) {

  const [data, setData] = useState(null)

  useEffect(() => {

    if (!isOpen) return

    analyticsService.getSprintAnalytics(sprintId)
      .then(setData)
      .catch(() => setData(null))

  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">

        <div className="
            bg-gray-950
            border border-gray-800
            rounded-xl
            w-full
            max-w-2xl
            max-h-[85vh]
            flex
            flex-col
        ">

            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-800">

            <h2 className="text-xl font-semibold text-purple-400">
                Sprint Analytics
            </h2>

            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-lg"
            >
                ✕
            </button>

            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-6 space-y-6">

            {data && (
                <>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">

                    <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Views</p>
                    <p className="text-xl">{data.views}</p>
                    </div>

                    <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Visitors</p>
                    <p className="text-xl">{data.visitors}</p>
                    </div>

                </div>

                {/* Dive performance */}
                {/* <div>

                    <p className="text-gray-400 mb-3">
                    Dive Performance
                    </p>

                    <div className="space-y-2">

                    {data.dives.map(d => (

                        <div
                        key={d.dive_id}
                        className="flex justify-between text-sm"
                        >

                        <span>{d.title}</span>
                        <span className="text-gray-400">👁 {d.views}</span>

                        </div>

                    ))}

                    </div>

                </div> */}

                {/* Traffic sources */}
                <div>

                    <p className="text-gray-400 mb-3">
                    Traffic Sources
                    </p>

                    <div className="space-y-2">

                    {data.sources.map(s => (

                        <div
                        key={s._id}
                        className="flex justify-between text-sm"
                        >

                        <span>{s._id || "direct"}</span>
                        <span>{s.count}</span>

                        </div>

                    ))}

                    </div>

                </div>
                </>
            )}

            </div>

        </div>

    </div>
  )
}

export default SprintAnalyticsModal