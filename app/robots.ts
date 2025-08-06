import type { MetadataRoute } from "next"
import { getCanonicalUrl } from "@/utils/getCanonicalUrl"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getCanonicalUrl()
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
