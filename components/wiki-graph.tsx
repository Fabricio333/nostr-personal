'use client'

import { useEffect, useRef } from 'react'
import { useI18n } from '@/components/locale-provider'
import { useTheme } from 'next-themes'
import * as d3 from 'd3'

interface GraphData {
  nodes: { id: string; title: string; tags: string[] }[]
  links: { source: string; target: string }[]
}

interface Settings {
  showArrows: boolean
  textFadeThreshold: number
  nodeSize: number
  linkWidth: number
  centerForce: number
  chargeForce: number
  linkForce: number
  linkDistance: number
  tagColors: Record<string, string>
  hiddenTags: string[]
}

export default function WikiGraph({
  data,
  settings,
}: {
  data: GraphData
  settings: Settings
}) {
  const ref = useRef<SVGSVGElement>(null)
  const { resolvedTheme } = useTheme()
  const { locale } = useI18n()

  useEffect(() => {
    const svg = d3.select(ref.current)
    const width = ref.current?.clientWidth || 800
    const height = 500
    svg.attr('viewBox', `0 0 ${width} ${height}`)
    svg.selectAll('*').remove()

    const isDark = resolvedTheme === 'dark'
    const themeLinkColor = isDark ? '#94a3b8' : '#475569'
    const nodeDefault = isDark ? '#60a5fa' : '#1f77b4'
    const textColor = isDark ? '#fff' : '#000'

    const adjustColor = (color: string) => {
      const c = d3.color(color)
      if (!c) return color
      return (isDark ? c.brighter(1) : c.darker(1)).formatHex()
    }

    const nodes = data.nodes
      .filter((n) => !settings.hiddenTags.some((t) => n.tags.includes(t)))
      .map((n) => ({ ...n }))
    const nodeIds = new Set(nodes.map((n) => n.id))
    const links = data.links
      .map((l) => ({
        source:
          typeof l.source === 'string'
            ? l.source
            : (l.source as any).id,
        target:
          typeof l.target === 'string'
            ? l.target
            : (l.target as any).id,
      }))
      .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target))

    const g = svg.append('g')

    if (settings.showArrows) {
      svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', themeLinkColor)
    }

    const linkForce = d3
      .forceLink(links as any)
      .id((d: any) => d.id)
      .distance(settings.linkDistance)
      .strength(settings.linkForce)

    const simulation = d3
      .forceSimulation(nodes as any)
      .force('link', linkForce)
      .force('charge', d3.forceManyBody().strength(settings.chargeForce))
      .force('x', d3.forceX(width / 2).strength(settings.centerForce))
      .force('y', d3.forceY(height / 2).strength(settings.centerForce))

    const link = g
      .append('g')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', settings.linkWidth)
      .attr('stroke', (d: any) => {
        const src =
          typeof d.source === 'string'
            ? nodes.find((n) => n.id === d.source)
            : (d.source as any)
        const tgt =
          typeof d.target === 'string'
            ? nodes.find((n) => n.id === d.target)
            : (d.target as any)
        const tag = src?.tags[0] || tgt?.tags[0]
        return adjustColor(settings.tagColors[tag] || themeLinkColor)
      })

    if (settings.showArrows) {
      link.attr('marker-end', 'url(#arrow)')
    }

    const node = g
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', settings.nodeSize)
      .attr('fill', (d: any) => settings.tagColors[d.tags[0]] || nodeDefault)

    const label = g
      .append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d) => d.title)
      .attr('font-size', 10)
      .attr('dx', 12)
      .attr('dy', '0.35em')
      .attr('fill', textColor)
      .style('opacity', 1)

    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 5])
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
          label.style(
            'opacity',
            event.transform.k >= settings.textFadeThreshold ? 1 : 0,
          )
        }),
    )

    label
      .on('mouseover', (event, d: any) => {
        node
          .filter((n: any) => n.id === d.id)
          .transition()
          .duration(200)
          .attr('r', settings.nodeSize + 4)
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('font-size', 14)
      })
      .on('mouseout', (event, d: any) => {
        node
          .filter((n: any) => n.id === d.id)
          .transition()
          .duration(200)
          .attr('r', settings.nodeSize)
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('font-size', 10)
      })

    node
      .on('click', (_event, d: any) => {
        const base = locale === 'es' ? '/es/digital-garden' : '/digital-garden'
        window.location.href = `${base}/${d.id}`
      })
      .on('mouseover', (event, d: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', settings.nodeSize + 4)
        label
          .filter((l: any) => l.id === d.id)
          .transition()
          .duration(200)
          .attr('font-size', 14)
      })
      .on('mouseout', (event, d: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', settings.nodeSize)
        label
          .filter((l: any) => l.id === d.id)
          .transition()
          .duration(200)
          .attr('font-size', 10)
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

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as any).x)
        .attr('y1', (d: any) => (d.source as any).y)
        .attr('x2', (d: any) => (d.target as any).x)
        .attr('y2', (d: any) => (d.target as any).y)
      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
      label.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y)
    })

    return () => {
      simulation.stop()
    }
  }, [data, resolvedTheme, locale, settings])

  return <svg ref={ref} className="h-[500px] w-full"></svg>
}

