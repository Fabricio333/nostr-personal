import { Github, Twitter, Linkedin, Mail } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold">About</h3>
            <p className="text-sm text-muted-foreground">
              A personal blog and portfolio showcasing my work, thoughts, and journey in technology.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/portfolio" className="block text-muted-foreground hover:text-primary">
                Portfolio
              </Link>
              <Link href="/events" className="block text-muted-foreground hover:text-primary">
                Events
              </Link>
              <Link href="/resume" className="block text-muted-foreground hover:text-primary">
                Resume
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Categories</h3>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground">Technology</div>
              <div className="text-muted-foreground">Design</div>
              <div className="text-muted-foreground">Personal</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Connect</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 My Personal Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
