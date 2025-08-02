import { NextResponse } from 'next/server'
import { getAllTranslations } from '@/lib/nostr-translations'

export async function GET() {
  const translations = await getAllTranslations()
  return NextResponse.json(translations)
}
