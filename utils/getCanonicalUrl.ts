import { headers } from "next/headers"

export function getCanonicalUrl(): string {
  const headersList = headers()
  const host =
    headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    "localhost:3000"
  const protocol = headersList.get("x-forwarded-proto") || "https"
  return process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
}
