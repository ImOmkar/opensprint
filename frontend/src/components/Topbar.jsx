import { useEffect, useState } from "react"
import { notificationService } from "../services/notificationService"

function Topbar({ onMenuClick }) {

  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    notificationService.get().then(setNotifications)
  }, [])

  const unreadCount = notifications?.filter(n => !n.is_read).length

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

      <div className="relative">

        <button onClick={() => setOpen(!open)} className="relative text-xl">
          🔔
        </button>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}

        {open && (
          <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50">

            {notifications?.length === 0 && (
              <div className="p-4 text-sm text-gray-400">
                No notifications
              </div>
            )}

            {notifications?.map(n => (
              <div
                key={n._id}
                onClick={async () => {
                  if (!n.is_read) {
                    await notificationService.markAsRead(n._id)
                    setNotifications(prev =>
                      prev.map(item =>
                        item._id === n._id
                          ? { ...item, is_read: true }
                          : item
                      )
                    )
                  }
                }}
                className={`p-4 border-b border-gray-800 text-sm cursor-pointer ${
                  n.is_read
                    ? "text-gray-500"
                    : "text-white bg-gray-800/50"
                }`}
              >
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-gray-400">{n.message}</div>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default Topbar