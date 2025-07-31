import dynamic from 'next/dynamic'
import { getNotesGraph } from '@/lib/digital-garden'

const GardenGraph = dynamic(() => import('@/components/garden-graph'), { ssr: false })

export default async function GardenGraphPage() {
  const graph = await getNotesGraph()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">Garden Graph</h1>
      <GardenGraph graph={graph} />
    </div>
  )
}

