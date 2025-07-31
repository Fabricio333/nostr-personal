import { NextResponse } from 'next/server'
import { getAllNotes } from '@/lib/digital-garden'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const includeContent = searchParams.get('content') === '1'
  const notes = await getAllNotes(includeContent)
  return NextResponse.json(notes)
}
