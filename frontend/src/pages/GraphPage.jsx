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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Fetch
  useEffect(() => {
    api.get("/deep-dives/graph").then(setData)
    userService.getMe().then(setUser).catch(() => navigate("/"))
  }, [])

  // Responsive sizing (FULL HEIGHT FIX)
  useEffect(() => {
    if (!data || !user || !containerRef.current) return

    const resize = () => {
      if (!containerRef.current) return

      const { width, height } = containerRef.current.getBoundingClientRect()

      setDimensions({
        width,
        height
      })
    }

    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [data, user])

  // Auto fit
  useEffect(() => {
    if (fgRef.current && data) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 80)
      }, 600)
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

      {/* Full screen wrapper */}
      <div className="flex flex-col h-[calc(100vh-64px)]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 bg-black/60 backdrop-blur flex justify-between items-center">

          <div>
            <h1 className="text-xl font-semibold text-white">
              Knowledge Graph
            </h1>
            <p className="text-sm text-gray-500">
              Visual map of your engineering brain
            </p>
          </div>

          <div className="text-xs text-gray-400 hidden sm:block">
            Nodes: {data.nodes.length} • Links: {data.links.length}
          </div>

        </div>

        {/* Graph area */}
        <div
          ref={containerRef}
          className="flex-1 relative bg-black"
        >

          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={data}
            backgroundColor="#000000"
            cooldownTicks={100}
            nodeRelSize={6}
            linkColor={() => "rgba(139,92,246,0.6)"}
            linkWidth={1.5}
            nodeLabel="name"

            onNodeClick={(node) => navigate(`/dive/${node.id}`)}
            onNodeHover={(node) => {
              document.body.style.cursor = node ? "pointer" : "default"
            }}

            nodeCanvasObject={(node, ctx, globalScale) => {

              const label = node.name
              const fontSize = 14 / globalScale

              ctx.font = `${fontSize}px Inter`
              ctx.textAlign = "left"
              ctx.textBaseline = "middle"

              // Glow circle
              ctx.beginPath()
              ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI)
              ctx.fillStyle = "#22c55e"
              ctx.shadowColor = "#22c55e"
              ctx.shadowBlur = 15
              ctx.fill()
              ctx.shadowBlur = 0

              // Label
              ctx.fillStyle = "#e5e7eb"
              ctx.fillText(label, node.x + 8, node.y)
            }}
          />

          {/* Floating controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3">

            <button
              onClick={() => fgRef.current.zoomToFit(400, 80)}
              className="bg-gray-900/80 backdrop-blur border border-gray-700 px-4 py-2 rounded-xl text-sm hover:border-purple-500 transition"
            >
              Fit
            </button>

            <button
              onClick={() => fgRef.current.zoom(1.2, 400)}
              className="bg-gray-900/80 backdrop-blur border border-gray-700 px-4 py-2 rounded-xl text-sm hover:border-purple-500 transition"
            >
              +
            </button>

            <button
              onClick={() => fgRef.current.zoom(0.8, 400)}
              className="bg-gray-900/80 backdrop-blur border border-gray-700 px-4 py-2 rounded-xl text-sm hover:border-purple-500 transition"
            >
              −
            </button>

          </div>

        </div>

      </div>

    </DashboardLayout>
  )
}

export default GraphPage