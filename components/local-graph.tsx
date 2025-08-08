'use client'

import { useMemo } from 'react'
import WikiGraph from '@/components/wiki-graph'
import * as d3 from 'd3'

interface Node {
  id: string
  title: string
  tags: string[]
}

interface Link {
  source: string
  target: string
}

export default function LocalGraph({
  nodes,
  links,
}: {
  nodes: Node[]
  links: Link[]
}) {
  const settings = useMemo(() => {
    const palette = d3.schemeCategory10
    const tagColors: Record<string, string> = {}
    const tags = Array.from(new Set(nodes.flatMap((n) => n.tags)))
    tags.forEach((tag, i) => {
      tagColors[tag] = palette[i % palette.length]
    })
    return {
      showArrows: false,
      textFadeThreshold: 2,
      nodeSize: 6,
      linkWidth: 1,
      centerForce: 0.3,
      chargeForce: -100,
      linkForce: 1,
      linkDistance: 60,
      tagColors,
      hiddenTags: [],
    }
  }, [nodes])

  return <WikiGraph data={{ nodes, links }} settings={settings} height={192} />
}

