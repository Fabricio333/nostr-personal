import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extracts the first image URL from a string if present
export function extractImageUrl(content: string): string | undefined {
  const match = content.match(/https?:\/\/[^\s]+\.(?:png|jpe?g|gif|webp)/i)
  return match ? match[0] : undefined
}
