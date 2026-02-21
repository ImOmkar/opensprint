// function DashboardHeader({ user, onNewSprint }) {

//     return (
  
//       <div className="flex justify-between items-center mb-8">
  
//         <div>
  
//           <h1 className="text-2xl font-bold">
//             Dashboard
//           </h1>
  
//           <p className="text-gray-500 text-sm">
//             Your engineering knowledge system
//           </p>
  
//         </div>
  
//         <button
//           onClick={onNewSprint}
//           className="
//             bg-green-500
//             hover:bg-green-400
//             text-black
//             px-4 py-2
//             rounded-lg
//             font-medium
//           "
//         >
//           New Sprint
//         </button>
  
//       </div>
  
//     )
//   }
  
//   export default DashboardHeader


import { useNavigate } from "react-router-dom"

function DashboardHeader({
  user,
  onMenuClick,
  onNewSprint,
  title = "Dashboard",
  subtitle = "Your engineering knowledge system"
}) {

  const navigate = useNavigate()

  return (

    <header className="
      border-b border-gray-800
      px-4 sm:px-6
      py-4
      flex items-center justify-between
      bg-black
      sticky top-0 z-30
    ">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">

        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="
            md:hidden
            text-gray-400
            hover:text-white
            text-xl
          "
        >
          ☰
        </button>

        {/* Title */}
        <div>

          <h1 className="text-lg sm:text-xl font-semibold">
            {title}
          </h1>

          <p className="text-gray-500 text-xs sm:text-sm">
            {subtitle}
          </p>

        </div>

      </div>


      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">

        {/* New Sprint button */}
        {onNewSprint && (
          <button
            onClick={onNewSprint}
            className="
              bg-green-500 hover:bg-green-400
              text-black
              px-3 py-1.5 sm:px-4 sm:py-2
              rounded-lg
              font-medium
              text-sm
            "
          >
            New Sprint
          </button>
        )}

        {/* User avatar (desktop only) */}
        {user && (
          <img
            src={user.avatar_url}
            onClick={() => navigate(`/u/${user.username}`)}
            className="
              hidden md:block
              w-8 h-8
              rounded-full
              cursor-pointer
              hover:ring-2 hover:ring-purple-500
            "
          />
        )}

      </div>

    </header>

  )

}

export default DashboardHeader