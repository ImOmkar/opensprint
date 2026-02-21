function Topbar({ onMenuClick }) {

    return (
      <div className="
        sticky top-0 z-30
        bg-black/80 backdrop-blur
        border-b border-gray-800
        px-4 py-3
        flex items-center gap-3
      ">
  
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-300 hover:text-white"
        >
          ☰
        </button>
  
        {/* Title */}
        <div>
          <h1 className="font-semibold">Dashboard</h1>
          <p className="text-xs text-gray-500">
            Your engineering knowledge system
          </p>
        </div>
  
      </div>
    )
  }
  
  export default Topbar