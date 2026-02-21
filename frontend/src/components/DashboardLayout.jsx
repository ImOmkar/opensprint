// import Sidebar from "./Sidebar"

// function DashboardLayout({ user, children }) {

//   return (
//     <div className="min-h-screen bg-black text-white flex">

//       {/* Sidebar */}
//       <Sidebar user={user} />

//       {/* Main Content */}
//       <main className="
//         flex-1
//         px-4 sm:px-6 lg:px-10
//         py-6 lg:py-10
//         overflow-y-auto
//       ">
//         {children}
//       </main>

//     </div>
//   )
// }

// export default DashboardLayout

// import { useState } from "react"
// import Sidebar from "./Sidebar"
// import DashboardHeader from "./DashboardHeader"


// function DashboardLayout({ user, children }) {

//   const [mobileOpen, setMobileOpen] = useState(false)

//   return (

//     <div className="flex bg-black text-white">

//       {/* Desktop */}
//       <Sidebar user={user} />


//       {/* Mobile overlay */}
//       {mobileOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/60 z-40 md:hidden"
//             onClick={() => setMobileOpen(false)}
//           />

//           <Sidebar
//             user={user}
//             mobile
//             onClose={() => setMobileOpen(false)}
//           />
//         </>
//       )}


//       {/* Main */}
//       <div className="flex-1 min-h-screen">

//         <DashboardHeader
//           user={user}
//           onMenuClick={() => setMobileOpen(true)}
//         />

//         <main className="p-4 sm:p-6">
//           {children}
//         </main>

//       </div>

//     </div>

//   )

// }

// export default DashboardLayout


import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { useState } from "react"

function DashboardLayout({ user, children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* Desktop sidebar */}
      <Sidebar user={user} />

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">

          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="relative z-50">
            <Sidebar user={user} mobile onClose={() => setSidebarOpen(false)} />
          </div>

        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">

        <Topbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="">
          {children}
        </main>

      </div>

    </div>
  )
}

export default DashboardLayout