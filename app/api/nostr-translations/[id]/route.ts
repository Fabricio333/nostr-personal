import { NextResponse } from 'next/server'
import { getTranslation } from '@/lib/nostr-translations'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const translation = await getTranslation(params.id)
  if (!translation) {
    return new NextResponse(null, { status: 404 })
  }
  return NextResponse.json(translation)
}
