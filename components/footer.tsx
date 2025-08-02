"use client"

import { useI18n } from "@/components/locale-provider"

interface FooterProps {
  siteName: string
}

export function Footer({ siteName }: FooterProps) {
  const { t } = useI18n()

  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <p>
          &copy; {new Date().getFullYear()} {siteName}. {t("footer.rights")}
        </p>
        <p className="mt-1">{t("footer.powered")}</p>
      </div>
    </footer>
  )
}
