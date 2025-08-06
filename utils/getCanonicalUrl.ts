export function getCanonicalUrl(path: string = ''): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fabri.lat'
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}
