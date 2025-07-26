export function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} My Personal Blog. All rights reserved.</p>
        <p className="mt-1">Powered by Nostr and Next.js</p>
      </div>
    </footer>
  )
}
