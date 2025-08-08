"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { generateStoryImage } from "@/lib/share-story"
import { useI18n } from "@/components/locale-provider"

interface Props {
  title: string
  tagline: string
  className?: string
}

export default function ShareStoryButton({ title, tagline, className }: Props) {
  const { t } = useI18n()

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    await generateStoryImage({ title, tagline })
  }

  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      className={className}
    >
      <Share2 className="mr-2 h-4 w-4" />
      {t("share_story")}
    </Button>
  )
}
