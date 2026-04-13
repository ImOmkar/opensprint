function StatCard({ label, value, color }) {

  return (
    <div className="
        bg-[var(--card)]
        border
        border-[var(--border)]
        rounded-xl
        p-5
      ">

      <p className="text-gray-500 text-sm">
        {label}
      </p>

      <p className={`text-3xl font-bold mt-1 ${color}`}>
        {value}
      </p>

    </div>
  )
}

export default StatCard