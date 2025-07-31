'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const ForceGraph2D = dynamic(
  () => import('react-force-graph').then((mod) => mod.ForceGraph2D),
  { ssr: false }
)

interface GraphData {
  nodes: { id: string; name: string }[]
  links: { source: string; target: string }[]
}

export default function GardenGraph({ graph }: { graph: GraphData }) {
  const router = useRouter()
  return (
    <div className="h-[80vh] w-full">
      <ForceGraph2D
        graphData={graph}
        nodeLabel="name"
        onNodeClick={(node) => {
          const id = (node as any).id
          if (id) {
            router.push(`/digital-garden/${id}`)
          }
        }}
      />
    </div>
  )
}

