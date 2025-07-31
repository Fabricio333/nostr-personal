'use client'

import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), { ssr: false })

interface GraphNode {
  id: string
  name: string
}

interface GraphLink {
  source: string
  target: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export default function GardenGraph({ data }: { data: GraphData }) {
  return (
    <div className="mb-8 h-64 w-full rounded-md border">
      {/* ForceGraph2D renders a canvas based graph of garden notes */}
      <ForceGraph2D
        graphData={data}
        nodeLabel="name"
        backgroundColor="rgba(0,0,0,0)"
        nodeColor={() => '#3b82f6'}
        linkColor={() => 'rgba(0,0,0,0.2)'}
      />
    </div>
  )
}

