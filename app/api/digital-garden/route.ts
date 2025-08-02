import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllNotes } from '@/lib/digital-garden'

export async function GET() {
  const locale = cookies().get('NEXT_LOCALE')?.value || 'en'
  const notes = await getAllNotes(locale)
  return NextResponse.json(notes)
}
