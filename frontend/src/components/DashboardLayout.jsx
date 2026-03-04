import { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

function DashboardLayout({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="relative z-50 h-full">
            <Sidebar user={user} mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto min-w-0 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
