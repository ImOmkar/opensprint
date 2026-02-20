function DashboardHeader({ user, onNewSprint }) {

    return (
  
      <div className="flex justify-between items-center mb-8">
  
        <div>
  
          <h1 className="text-2xl font-bold">
            Dashboard
          </h1>
  
          <p className="text-gray-500 text-sm">
            Your engineering knowledge system
          </p>
  
        </div>
  
        <button
          onClick={onNewSprint}
          className="
            bg-green-500
            hover:bg-green-400
            text-black
            px-4 py-2
            rounded-lg
            font-medium
          "
        >
          New Sprint
        </button>
  
      </div>
  
    )
  }
  
  export default DashboardHeader