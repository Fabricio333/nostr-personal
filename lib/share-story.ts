'use client'

import { toPng } from 'html-to-image'

export async function generateStoryImage({
  title,
  tagline,
}: {
  title: string
  tagline: string
}) {
  const container = document.createElement('div')
  container.style.width = '1080px'
  container.style.height = '1920px'
  container.style.display = 'flex'
  container.style.flexDirection = 'column'
  container.style.justifyContent = 'center'
  container.style.alignItems = 'center'
  container.style.backgroundColor = '#ffffff'
  container.style.padding = '80px'
  container.style.fontFamily = 'system-ui, sans-serif'
  container.style.position = 'relative'
  container.style.textAlign = 'center'

  const titleEl = document.createElement('div')
  titleEl.textContent = title
  titleEl.style.fontSize = '64px'
  titleEl.style.fontWeight = 'bold'
  titleEl.style.marginBottom = '40px'
  container.appendChild(titleEl)

  const taglineEl = document.createElement('div')
  taglineEl.textContent = tagline
  taglineEl.style.fontSize = '48px'
  container.appendChild(taglineEl)

  const brandingEl = document.createElement('div')
  brandingEl.textContent = '🧘 Fabricio'
  brandingEl.style.position = 'absolute'
  brandingEl.style.bottom = '80px'
  brandingEl.style.left = '50%'
  brandingEl.style.transform = 'translateX(-50%)'
  brandingEl.style.fontSize = '48px'
  container.appendChild(brandingEl)

  document.body.appendChild(container)
  const dataUrl = await toPng(container)
  document.body.removeChild(container)

  const link = document.createElement('a')
  link.download = `${title}.png`
  link.href = dataUrl
  link.click()
}
