export function getCanonicalUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not defined")
  }
  return siteUrl
}
