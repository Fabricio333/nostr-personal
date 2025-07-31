'use client'

import dynamic from 'next/dynamic'
import type { GardenGraph as GardenGraphData } from '@/lib/digital-garden'

const ForceGraph2D = dynamic(
  () => import('react-force-graph').then((mod) => mod.ForceGraph2D),
  { ssr: false }
)

export default function GardenGraph({ data }: { data: GardenGraphData }) {
  return (
    <div className="h-96 w-full rounded-md border bg-card">
      <ForceGraph2D
        graphData={data}
        nodeLabel={(node) => (node as any).title}
        nodeAutoColorBy="id"
        linkColor={() => 'rgba(100,100,100,0.2)'}
        backgroundColor="transparent"
      />
    </div>
  )
}
