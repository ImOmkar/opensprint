import Sidebar from "./Sidebar"

function DashboardLayout({ user, children }) {

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="
        flex-1
        px-4 sm:px-6 lg:px-10
        py-6 lg:py-10
        overflow-y-auto
      ">
        {children}
      </main>

    </div>
  )
}

export default DashboardLayout