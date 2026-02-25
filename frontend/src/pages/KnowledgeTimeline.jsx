// import { useEffect, useState } from "react"
// import { timelineService } from "../services/timelineService"
// import DashboardLayout from "../components/DashboardLayout"
// import { useNavigate } from "react-router-dom"
// import { userService } from "../services/userService"

// function KnowledgeTimeline() {
//     const [user, setUser] = useState(null)
//   const [timeline, setTimeline] = useState({})
//   const navigate = useNavigate()

//   useEffect(() => {
//     timelineService.get().then(setTimeline)

//     userService.getMe()
//       .then(setUser)
//       .catch(() => navigate("/"))
//   }, [])

//   const groupByDate = (dives) => {

//     const groups = {}
  
//     dives.forEach(dive => {
//       const date = new Date(dive.created_at)
//         .toISOString()
//         .split("T")[0]
  
//       if (!groups[date]) groups[date] = []
//       groups[date].push(dive)
//     })
  
//     return groups
//   }


//   const dates = Object.keys(timeline)

//   console.log(dates)
//   return (
//     <DashboardLayout user={user}>

//       <div className="px-6 py-8 max-w-4xl mx-auto">

//         <h1 className="text-2xl font-bold text-green-400 mb-8">
//           Knowledge Timeline
//         </h1>

//         <div className="relative border-l border-gray-800 pl-6 space-y-10">

//           {dates.map(date => (

//             <div key={date}>

//               {/* Date */}
//               <div className="text-sm text-gray-400 mb-3">
//                 {date}
//               </div>

//               {/* Dives */}
//               <div className="space-y-3">

//                 {timeline[date].map(dive => (

//                   <div
//                     key={dive.id}
//                     onClick={() =>
//                       navigate(`/sprint/${dive.sprint_id}`)
//                     }
//                     className="
//                       bg-gray-900
//                       border border-gray-800
//                       rounded-lg
//                       p-4
//                       cursor-pointer
//                       hover:border-green-500
//                       transition
//                     "
//                   >
//                     <p className="text-green-400 font-medium">
//                       {dive.title}
//                     </p>
//                   </div>

//                 ))}

//               </div>

//             </div>

//           ))}

//         </div>

//       </div>

//     </DashboardLayout>
//   )
// }

// export default KnowledgeTimeline

import { useEffect, useState } from "react"
import { timelineService } from "../services/timelineService"
import DashboardLayout from "../components/DashboardLayout"
import { useNavigate } from "react-router-dom"
import { userService } from "../services/userService"

function KnowledgeTimeline() {

  const [user, setUser] = useState(null)
  const [timeline, setTimeline] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    timelineService.get().then(setTimeline)

    userService.getMe()
      .then(setUser)
      .catch(() => navigate("/"))
  }, [])

  /* ---------------- DATE LABEL ---------------- */

  const formatDateLabel = (date) => {
    const today = new Date().toISOString().split("T")[0]

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yISO = yesterday.toISOString().split("T")[0]

    if (date === today) return "Today"
    if (date === yISO) return "Yesterday"

    return new Date(date).toDateString()
  }

  /* ---------------- SORT DATES ---------------- */

  const dates = Object.keys(timeline)
    .sort((a, b) => new Date(b) - new Date(a))

  if (!user) return null

  return (
    <DashboardLayout user={user}>

      <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-green-400 mb-10">
          Knowledge Timeline
        </h1>

        {/* Timeline */}
        <div className="relative">

          {/* Vertical Line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-[4px] bg-green-800" />

          <div className="space-y-10">

            {dates.map(date => (

              <div key={date} className="relative pl-10">

                {/* Date Label */}
                <div className="text-sm text-gray-400 mb-4">
                  {formatDateLabel(date)}
                </div>

                {/* Dives */}
                <div className="space-y-4">

                  {timeline[date].map(dive => (

                    <div
                      key={dive.id}
                      onClick={() =>
                        navigate(`/sprint/${dive.sprint_id}`)
                      }
                      className="
                        relative
                        bg-gray-900
                        border border-gray-800
                        rounded-xl
                        p-4
                        cursor-pointer
                        hover:border-green-500
                        hover:bg-gray-900/80
                        transition
                      "
                    >

                      {/* Timeline Dot */}
                      <div className="
                        absolute
                        -left-[30px]
                        top-5
                        w-3 h-3
                        bg-green-400
                        rounded-full
                        shadow-md
                      " />

                      <p className="text-green-400 font-medium">
                        {dive.title}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </DashboardLayout>
  )
}

export default KnowledgeTimeline