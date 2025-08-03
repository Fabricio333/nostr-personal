import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function localizePath(locale: string, path: string) {
  if (!path.startsWith("/")) path = `/${path}`
  if (locale === "en") return path
  return path === "/" ? `/${locale}` : `/${locale}${path}`
}

export function stripLocale(path: string) {
  const stripped = path.replace(/^\/(?:en|es)(?=\/|$)/, "")
  if (!stripped) return "/"
  return stripped.startsWith("/") ? stripped : `/${stripped}`
}
