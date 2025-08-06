"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/locale-provider"

interface Note {
  slug: string
  title: string
  tags: string[]
}

export default function DigitalGardenList({
  notes,
  locale,
}: {
  notes: Note[]
  locale: string
}) {
  const [visibleCount, setVisibleCount] = useState(12)
  const { t } = useI18n()
  const visibleNotes = notes.slice(0, visibleCount)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleNotes.map((note) => (
          <Link
            key={note.slug}
            href={
              locale === "es"
                ? `/es/digital-garden/${note.slug}`
                : `/digital-garden/${note.slug}`
            }
            className="block"
          >
            <Card className="h-full transition-colors hover:bg-muted">
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
              </CardHeader>
              {note.tags.length > 0 && (
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
      {visibleCount < notes.length && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => setVisibleCount((c) => c + 12)}
            variant="outline"
            className="border-green-500 text-green-500"
          >
            {t("show_more")}
          </Button>
        </div>
      )}
    </>
  )
}
