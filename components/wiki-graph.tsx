'use client'

import { useEffect, useRef } from 'react'
import { useI18n } from '@/components/locale-provider'
import { useTheme } from 'next-themes'
import * as d3 from 'd3'

interface GraphData {
  nodes: { id: string; title: string }[]
  links: { source: string; target: string }[]
}

export default function WikiGraph({ data }: { data: GraphData }) {
  const ref = useRef<SVGSVGElement>(null)
  const { resolvedTheme } = useTheme()
  const { locale } = useI18n()

  useEffect(() => {
    const svg = d3.select(ref.current)
    const width = ref.current?.clientWidth || 800
    const height = 600
    svg.attr('viewBox', `0 0 ${width} ${height}`)
    svg.selectAll('*').remove()

    const isDark = resolvedTheme === 'dark'
    const linkColor = isDark ? '#555' : '#999'
    const nodeColor = isDark ? '#60a5fa' : '#1f77b4'
    const highlightColor = isDark ? '#93c5fd' : '#3b82f6'
    const textColor = isDark ? '#fff' : '#000'

    const simulation = d3
      .forceSimulation(data.nodes as any)
      .force(
        'link',
        d3.forceLink(data.links as any).id((d: any) => d.id).distance(100),
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))

    const link = svg
      .append('g')
      .attr('stroke', linkColor)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', nodeColor)
      .style('cursor', 'pointer')
      .on('mouseover', function () {
        d3.select(this).attr('fill', highlightColor)
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', nodeColor)
      })
      .on('click', (_event, d: any) => {
        const base = locale === 'es' ? '/es/digital-garden' : '/digital-garden'
        window.location.href = `${base}/${d.id}`
      })
      .call(
        d3
          .drag<SVGCircleElement, any>()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          }),
      )

    const label = svg
      .append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .text((d) => d.title)
      .attr('font-size', 10)
      .attr('dx', 12)
      .attr('dy', '0.35em')
      .attr('fill', textColor)

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as any).x)
        .attr('y1', (d: any) => (d.source as any).y)
        .attr('x2', (d: any) => (d.target as any).x)
        .attr('y2', (d: any) => (d.target as any).y)
      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)
      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
    })

    return () => {
      simulation.stop()
    }
  }, [data, resolvedTheme, locale])

  return <svg ref={ref} className="h-[600px] w-full rounded-lg border bg-card"></svg>
}
