interface FooterProps {
  siteName: string
}

export function Footer({ siteName }: FooterProps) {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="w-full max-w-screen-md mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        <p className="mt-1">Powered by Nostr and Next.js</p>
      </div>
    </footer>
  )
}
