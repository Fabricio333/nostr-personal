import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Checks if a URL points to a common image extension
export function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp)$/i.test(url)
}

// Extracts the first image URL from a string if present
export function extractImageUrl(content: string): string | undefined {
  const urlRegex = /https?:\/\/[^\s]+/g
  const matches = content.match(urlRegex)
  if (!matches) return undefined
  return matches.find((url) => isImageUrl(url))
}
