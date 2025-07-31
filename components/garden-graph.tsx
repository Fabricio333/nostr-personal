"use client"

import { ForceGraph2D } from "react-force-graph"

interface GraphProps {
  graph: { nodes: { id: string; title: string }[]; links: { source: string; target: string }[] }
}

export default function GardenGraph({ graph }: GraphProps) {
  return (
    <div className="h-[600px] w-full">
      <ForceGraph2D
        graphData={graph}
        nodeLabel="title"
        nodeAutoColorBy="id"
        onNodeClick={(node) => {
          if (typeof window !== "undefined") {
            window.location.href = `/digital-garden/${(node as any).id}`
          }
        }}
      />
    </div>
  )
}

