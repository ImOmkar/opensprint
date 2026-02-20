import { useEffect, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { api } from "../api/client"
import { useNavigate } from "react-router-dom"

function GraphPage() {

  const [data, setData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get("/deep-dives/graph")
      .then(setData)
  }, [])

  if (!data) return <div className="text-white p-10">Loading graph...</div>

  return (
    <div className="min-h-screen bg-black">

        <ForceGraph2D
            graphData={data}
            cooldownTicks={100}
            backgroundColor="#000000"

            nodeLabel="name"

            nodeRelSize={6}

            linkColor={() => "#8b5cf6"}

            nodeColor={() => "#22c55e"}

            linkWidth={1.5}

            onNodeClick={(node) => navigate(`/dive/${node.id}`)}

            onNodeHover={(node) => {
                document.body.style.cursor = node ? "pointer" : "default"
              }}

            nodeCanvasObject={(node, ctx, globalScale) => {

                const label = node.name

                const fontSize = 14 / globalScale

                ctx.font = `${fontSize}px Sans-Serif`

                ctx.fillStyle = "#22c55e"

                ctx.beginPath()
                ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false)
                ctx.fill()

                ctx.fillStyle = "#e5e7eb"

                ctx.fillText(
                label,
                node.x + 6,
                node.y + 3
                )
            }}

            nodePointerAreaPaint={(node, color, ctx) => {

                ctx.fillStyle = color

                ctx.beginPath()

                ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false)

                ctx.fill()

            }}
        />

    </div>
  )
}

export default GraphPage