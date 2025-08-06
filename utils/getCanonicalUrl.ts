import { headers } from "next/headers"

export function getCanonicalUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) {
    return new URL(path, siteUrl).toString()
  }

  const headerList = headers()
  const host = headerList.get("host") || "localhost:3000"
  const protocol = headerList.get("x-forwarded-proto") || "http"
  return `${protocol}://${host}${path}`
}
