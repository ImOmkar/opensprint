function StatCard({ label, value, color }) {

    return (
      <div className="
        bg-gradient-to-br from-gray-900 to-gray-950
        border border-gray-800
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