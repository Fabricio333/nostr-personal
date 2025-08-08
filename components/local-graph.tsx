'use client'

import WikiGraph from '@/components/wiki-graph'

interface GraphData {
  nodes: { id: string; title: string; tags: string[] }[]
  links: { source: string; target: string }[]
}

export default function LocalGraph({ data }: { data: GraphData }) {
  const settings = {
    showArrows: false,
    textFadeThreshold: 1,
    nodeSize: 6,
    linkWidth: 1,
    centerForce: 0.3,
    chargeForce: -100,
    linkForce: 1,
    linkDistance: 80,
    tagColors: {},
    hiddenTags: [],
  }

  return <WikiGraph data={data} settings={settings} height={300} />
}
