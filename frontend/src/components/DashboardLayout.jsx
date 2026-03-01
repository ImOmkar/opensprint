import { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { Toaster } from "react-hot-toast"


function DashboardLayout({ user, children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      
      {/* toast component */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            border: "1px solid #374151",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#111827",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#111827",
            },
          },
        }}
      />

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

          <div className="relative z-50 h-full">
            <Sidebar
              user={user}
              mobile
              onClose={() => setSidebarOpen(false)}
            />
          </div>

        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        <Topbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto min-w-0 scroll-smooth">
          {children}
        </main>

      </div>

    </div>
  )
}

export default DashboardLayout