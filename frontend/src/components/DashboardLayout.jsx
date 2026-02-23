import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { useState } from "react"

function DashboardLayout({ user, children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white flex overflow-x-hidden">

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">

          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="relative z-50">
            <Sidebar
              user={user}
              mobile
              onClose={() => setSidebarOpen(false)}
            />
          </div>

        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        <Topbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-w-0">
          {children}
        </main>

      </div>

    </div>
  )
}

export default DashboardLayout