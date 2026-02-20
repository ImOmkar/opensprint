import StatCard from "./StatCard"

function StatGrid({ stats }) {

  return (

    <div className="
      grid
      grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
      gap-4
      mb-10
    ">

      <StatCard
        label="Active Sprints"
        value={stats.active}
        color="text-green-400"
      />

      <StatCard
        label="Completed"
        value={stats.completed}
        color="text-blue-400"
      />

      <StatCard
        label="Deep Dives"
        value={stats.dives}
        color="text-purple-400"
      />

    </div>

  )
}

export default StatGrid