import { useEffect, useState, useMemo } from "react"
import { activityService } from "../services/activityService"
import StreakMilestones from "./StreakMilestones"

function ActivityHeatmap() {

    const [data, setData] = useState(null)
    const [tooltip, setTooltip] = useState(null)

    useEffect(() => {
        activityService.get().then(setData)
    }, [])

    useEffect(() => {
        if (data?.earned_milestones?.includes(data?.current_streak)) {
            alert("🔥 New Milestone Unlocked!")
        }
    }, [data])

    const todayISO = new Date().toISOString().split("T")[0]

    const days = useMemo(() => {
        const today = new Date()
        const result = []

        for (let i = 364; i >= 0; i--) {
            const d = new Date()
            d.setDate(today.getDate() - i)
            result.push(d.toISOString().split("T")[0])
        }

        // Remove future days just in case
        return result.filter(d => d <= todayISO)
    }, [todayISO])

    if (!data) return null

    const getColor = (count) => {
        if (!count) return "bg-gray-800"
        if (count === 1) return "bg-green-900"
        if (count <= 3) return "bg-green-700"
        return "bg-green-500"
    }

    // Build weeks (7 days per column)
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7))
    }

    return (
        <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="text-green-400 font-semibold text-sm sm:text-base">
                    Knowledge Activity
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                        🔥 {data.current_streak} day streak
                    </div>
                    {!data.wrote_today && data.current_streak === 0 && (
                        <div className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse">
                            ✍ Start your streak
                        </div>
                    )}
                    {!data.wrote_today && data.current_streak > 0 && (
                        <div className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/40 animate-pulse">
                            ⚠ Don’t break it
                        </div>
                    )}
                </div>
            </div>


            <StreakMilestones
                streak={data?.current_streak}
                earned={data?.earned_milestones}
            />

            {/* Heatmap */}
            <div className="w-full overflow-x-auto py-2">
                <div className="inline-flex gap-[2px] sm:gap-1">

                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[2px] sm:gap-1">

                            {week.map(day => {
                                const count = data.activity[day] || 0

                                return (
                                    <div
                                        key={day}
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect()
                                            setTooltip({
                                                day,
                                                count,
                                                x: rect.left + rect.width / 2,
                                                y: rect.top
                                            })
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        className={`
                        w-2 h-2 sm:w-3 sm:h-3
                        rounded-sm
                        transition-all duration-150
                        ${getColor(count)}
                        hover:brightness-125
                        `}
                                    />
                                )
                            })}

                        </div>
                    ))}

                </div>
            </div>

            {/* Footer Stats */}
            <div className="hidden sm:flex justify-between mt-4 text-xs text-gray-400">
                <span>Longest: {data.longest_streak}</span>
                <span>Total Active: {data.total_active_days}</span>
            </div>

            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 40,
                        transform: "translateX(-50%)"
                    }}
                >
                    <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-gray-700 whitespace-nowrap">
                        <div className="font-medium">
                            {tooltip.day}
                        </div>
                        <div className="text-gray-400">
                            {tooltip.count} {tooltip.count === 1 ? "dive" : "dives"}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default ActivityHeatmap