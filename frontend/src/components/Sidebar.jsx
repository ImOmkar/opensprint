import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"

function Sidebar({ user }) {

  const navigate = useNavigate()

  const handleLogout = async () => {

    try {

      await authService.logout()

      navigate("/")

    } catch (err) {

      console.error(err)

      navigate("/")
    }

  }

  return (

    <aside className="
      hidden md:flex
      w-64
      bg-gray-950
      border-r border-gray-800
      flex-col
      justify-between
      p-4
    ">

      <div>

        {/* Profile */}
        <div className="flex items-center gap-3 mb-6">

          <img
            src={user.avatar_url}
            className="w-10 h-10 rounded-full"
          />

          <div>
            <p className="font-semibold">
              {user.username}
            </p>

            <button
              onClick={() => navigate(`/u/${user.username}`)}
              className="text-xs text-purple-400 hover:underline"
            >
              Public Profile
            </button>

          </div>

        </div>

        {/* Navigation */}
        <nav className="space-y-1">

          <NavItem label="Dashboard" onClick={() => navigate("/dashboard")} />

          <NavItem label="Knowledge Graph" onClick={() => navigate("/graph")} />

          <NavItem label="Public Profile" onClick={() => navigate(`/u/${user.username}`)} />

        </nav>

      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="text-red-400 hover:text-red-300 text-sm text-left"
      >
        Logout
      </button>

    </aside>

  )
}

function NavItem({ label, onClick }) {

  return (
    <button
      onClick={onClick}
      className="
        w-full
        text-left
        px-3 py-2
        rounded-lg
        text-gray-300
        hover:bg-gray-800
        hover:text-white
        transition
      "
    >
      {label}
    </button>
  )
}

export default Sidebar