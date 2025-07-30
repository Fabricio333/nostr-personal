import { NextResponse } from 'next/server'
import { getAllNotes } from '@/lib/digital-garden'

export async function GET() {
  const notes = await getAllNotes()
  return NextResponse.json(notes)
}
