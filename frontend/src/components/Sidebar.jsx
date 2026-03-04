import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { authService } from "../services/authService"
import ConfirmModal from "./ConfirmModal"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

function Sidebar({ user, mobile = false, onClose }) {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    try {
      await authService.logout()
      await refreshUser()
      navigate("/")
      toast.success("Logged out successfully")
    } catch (err) {
      console.error(err)
      navigate("/")
    } finally {
      setShowLogoutConfirm(false)
    }
  }

  const go = (path) => {
    navigate(path)

    if (mobile && onClose) onClose()
  }

  return (
    <>
      <aside
        className={`
          ${mobile ? "flex" : "hidden md:flex"}
          w-64
          ${mobile ? "h-full fixed z-50" : "min-h-screen"}
          bg-gray-950
          border-r border-gray-800
          flex-col
          justify-between
          p-4
        `}
      >
        <div>
          <div className="flex items-center gap-3 mb-6">
            <img src={user?.avatar_url} className="w-10 h-10 rounded-full" />

            <div>
              <p className="font-semibold text-white">{user?.username}</p>

              <button
                onClick={() => go(`/u/${user?.username}`)}
                className="text-xs text-purple-400 hover:underline"
              >
                Public Profile
              </button>
            </div>
          </div>

          <nav className="space-y-1">
            <NavItem
              label="Dashboard"
              active={location.pathname === "/dashboard"}
              onClick={() => go("/dashboard")}
            />

            <NavItem
              label="Knowledge Graph"
              active={location.pathname === "/graph"}
              onClick={() => go("/graph")}
            />

            <NavItem
              label="Public Profile"
              active={location.pathname.startsWith("/u/")}
              onClick={() => go(`/u/${user.username}`)}
            />

            <NavItem
              label="Knowledge Timeline"
              active={location.pathname === "/timeline"}
              onClick={() => go("/timeline")}
            />
          </nav>
        </div>

        <button
          onClick={handleLogoutClick}
          className="
            text-red-400 hover:text-red-300
            text-sm text-left
            px-3 py-2
            rounded-lg
            hover:bg-gray-800
            transition
          "
        >
          Logout
        </button>
      </aside>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  )
}

function NavItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        text-left
        px-3 py-2
        rounded-lg
        transition
        ${
          active
            ? "bg-gray-800 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }
      `}
    >
      {label}
    </button>
  )
}

export default Sidebar
