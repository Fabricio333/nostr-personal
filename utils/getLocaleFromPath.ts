import { headers } from "next/headers"

export function getLocaleFromPath(): "en" | "es" {
  const headerList = headers()
  const path =
    headerList.get("x-matched-path") ||
    headerList.get("x-invoke-path") ||
    headerList.get("x-url") ||
    "/"
  return path.startsWith("/es") ? "es" : "en"
}
