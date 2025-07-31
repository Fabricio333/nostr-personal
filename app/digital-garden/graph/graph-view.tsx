"use client"

import ForceGraph2D from 'react-force-graph'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface GraphNode {
  id: string
  name: string
}

interface GraphLink {
  source: string
  target: string
}

export default function GraphView({
  nodes,
  links,
}: {
  nodes: GraphNode[]
  links: GraphLink[]
}) {
  const router = useRouter()
  const data = useMemo(() => ({ nodes, links }), [nodes, links])
  return (
    <div className="h-[600px] w-full">
      <ForceGraph2D
        graphData={data}
        nodeLabel="name"
        onNodeClick={(node: any) => router.push(`/digital-garden/${node.id}`)}
      />
    </div>
  )
}

