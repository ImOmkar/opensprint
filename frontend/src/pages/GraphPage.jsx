// import { useEffect, useState } from "react"
// import ForceGraph2D from "react-force-graph-2d"
// import { api } from "../api/client"
// import { useNavigate } from "react-router-dom"
// import DashboardLayout from "../components/DashboardLayout"
// import { userService } from "../services/userService"

// function GraphPage() {
//   const navigate = useNavigate()
//   const [user, setUser] = useState(null)
//   const [data, setData] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     api.get("/deep-dives/graph")
//       .then(setData)
    
//     userService.getMe()
//     .then(async data => {
//       setUser(data)
//       setLoading(false)
//     })
//     .catch(() => navigate("/"))
//   }, [])

//   if (!data) return <div className="text-white p-10">Loading graph...</div>

//   return (
//     // <div className="min-h-screen bg-black">
//     <DashboardLayout user={user}>

//         <ForceGraph2D
//             graphData={data}
//             cooldownTicks={100}
//             backgroundColor="#000000"

//             nodeLabel="name"

//             nodeRelSize={6}

//             linkColor={() => "#8b5cf6"}

//             nodeColor={() => "#22c55e"}

//             linkWidth={1.5}

//             onNodeClick={(node) => navigate(`/dive/${node.id}`)}

//             onNodeHover={(node) => {
//                 document.body.style.cursor = node ? "pointer" : "default"
//               }}

//             nodeCanvasObject={(node, ctx, globalScale) => {

//                 const label = node.name

//                 const fontSize = 14 / globalScale

//                 ctx.font = `${fontSize}px Sans-Serif`

//                 ctx.fillStyle = "#22c55e"

//                 ctx.beginPath()
//                 ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false)
//                 ctx.fill()

//                 ctx.fillStyle = "#e5e7eb"

//                 ctx.fillText(
//                 label,
//                 node.x + 6,
//                 node.y + 3
//                 )
//             }}

//             nodePointerAreaPaint={(node, color, ctx) => {

//                 ctx.fillStyle = color

//                 ctx.beginPath()

//                 ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false)

//                 ctx.fill()

//             }}
//         />

//     {/* </div> */}
//     </DashboardLayout>
//   )
// }

// export default GraphPage

import { useEffect, useState, useRef } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { api } from "../api/client"
import { useNavigate } from "react-router-dom"
import DashboardLayout from "../components/DashboardLayout"
import { userService } from "../services/userService"

function GraphPage() {

  const navigate = useNavigate()

  const fgRef = useRef()
  const containerRef = useRef()

  const [user, setUser] = useState(null)
  const [data, setData] = useState(null)

  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 600
  })


  // Fetch data
  useEffect(() => {

    api.get("/deep-dives/graph")
      .then(setData)

    userService.getMe()
      .then(setUser)
      .catch(() => navigate("/"))

  }, [])


  // Responsive sizing
  useEffect(() => {

    const updateSize = () => {

      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()

      setDimensions({
        width: rect.width,
        height: window.innerHeight - rect.top - 20
      })
    }

    updateSize()

    window.addEventListener("resize", updateSize)

    return () => window.removeEventListener("resize", updateSize)

  }, [])


  // Auto fit graph
  useEffect(() => {

    if (fgRef.current && data) {

      setTimeout(() => {

        fgRef.current.zoomToFit(400, 50)

      }, 500)

    }

  }, [data])


  if (!data || !user) {

    return (
      <DashboardLayout user={user}>
        <div className="text-gray-400 p-6">
          Loading knowledge graph...
        </div>
      </DashboardLayout>
    )
  }


  return (

    <DashboardLayout user={user}>

      {/* Page header */}
      <div className="mb-4 px-4 sm:px-4">

        <h1 className="text-xl font-semibold text-white mt-2">
          Knowledge Graph
        </h1>

        <p className="text-sm text-gray-500">
          Visual map of your engineering knowledge
        </p>

      </div>


      {/* Graph container */}
      <div
        ref={containerRef}
        className="
          w-full
          border-t border-gray-800
          relative
        "
      >

        <ForceGraph2D

          ref={fgRef}

          width={dimensions.width}
          height={dimensions.height}

          graphData={data}

          backgroundColor="#000000"

          cooldownTicks={100}

          nodeRelSize={6}

          linkColor={() => "#8b5cf6"}

          linkWidth={1.5}

          nodeColor={() => "#22c55e"}

          nodeLabel="name"


          // Navigation
          onNodeClick={(node) => navigate(`/dive/${node.id}`)}

          onNodeHover={(node) => {
            document.body.style.cursor =
              node ? "pointer" : "default"
          }}


          // Custom node rendering
          nodeCanvasObject={(node, ctx, globalScale) => {

            const label = node.name

            const fontSize = 14 / globalScale

            ctx.font = `${fontSize}px Sans-Serif`

            ctx.fillStyle = "#22c55e"

            ctx.beginPath()
            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI)
            ctx.fill()

            ctx.fillStyle = "#e5e7eb"

            ctx.fillText(
              label,
              node.x + 6,
              node.y + 3
            )

          }}

        />

      </div>


      {/* Controls */}
      <div className="px-4 sm:px-6 mt-4 flex gap-3">

        <button
          onClick={() => fgRef.current.zoomToFit(400)}
          className="
            text-sm
            px-3 py-1.5
            bg-gray-900
            border border-gray-700
            rounded
            hover:border-purple-500
          "
        >
          Fit to screen
        </button>

        <button
          onClick={() => fgRef.current.zoom(1.2, 400)}
          className="
            text-sm
            px-3 py-1.5
            bg-gray-900
            border border-gray-700
            rounded
            hover:border-purple-500
          "
        >
          Zoom in
        </button>

        <button
          onClick={() => fgRef.current.zoom(0.8, 400)}
          className="
            text-sm
            px-3 py-1.5
            bg-gray-900
            border border-gray-700
            rounded
            hover:border-purple-500
          "
        >
          Zoom out
        </button>

      </div>

    </DashboardLayout>

  )

}

export default GraphPage