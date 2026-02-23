function StreakMilestones({ streak, earned }) {

    const badges = [
        { value: 7, label: "7 Day Streak 🔥" },
        { value: 30, label: "30 Day Discipline 💪" },
        { value: 90, label: "90 Day Mastery 🧠" },
        { value: 365, label: "Knowledge Monk 🧘" }
    ]

    return (
        <div className="mt-4 flex flex-wrap gap-3">

            {badges.map(badge => {

                const achieved = earned.includes(badge.value)

                return (
                    <div
                        key={badge.value}
                        className={`
                px-3 py-1 rounded-full text-xs font-medium
                border transition-all
                ${achieved
                                ? "bg-green-600/20 text-green-400 border-green-600"
                                : "bg-gray-800 text-gray-500 border-gray-700"}
              `}
                    >
                        {badge.label}
                    </div>
                )
            })}

        </div>
    )
}

export default StreakMilestones