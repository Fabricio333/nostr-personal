import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Download, Mail, Phone, MapPin, Linkedin, Github } from "lucide-react"

export default function ResumePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2">John Doe</CardTitle>
          <p className="text-lg text-muted-foreground">Full-Stack Developer | Blockchain Enthusiast</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <a href="mailto:john.doe@example.com" className="hover:underline">
                john.doe@example.com
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>(123) 456-7890</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-1">
              <Linkedin className="h-4 w-4" />
              <a
                href="https://linkedin.com/in/johndoe"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                LinkedIn
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Github className="h-4 w-4" />
              <a
                href="https://github.com/johndoe"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
            </div>
          </div>
          <Button className="mt-6" asChild>
            <a href="/path/to/your/resume.pdf" download>
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </a>
          </Button>
        </CardHeader>

        <Separator className="my-8" />

        <CardContent className="space-y-8">
          {/* Summary */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <p className="text-muted-foreground">
              Highly motivated and results-oriented Full-Stack Developer with 5+ years of experience in building and
              deploying scalable web applications. Proficient in modern JavaScript frameworks, backend technologies, and
              passionate about decentralized systems and blockchain technology.
            </p>
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Experience</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold">Content Writer</h3>
                <p className="text-muted-foreground">WeAreBitcoin.org | Mar 2025 – Present</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>
                    Create and manage educational content for a Bitcoin-focused learning platform centered on self-custody and sound money principles.
                  </li>
                  <li>
                    Prototype interactive tools and guided lessons to help users understand complex Bitcoin and privacy concepts.
                  </li>
                  <li>
                    Collaborate on content strategy, UX, and communication design to optimize learning outcomes.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold">Founder — Web Password Manager (OPSEC)</h3>
                <p className="text-muted-foreground">Personal Project | Dec 2024 – Mar 2025</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>
                    Developed a local password manager browser app with a single private key (BIP-39 mnemonic) to deterministically generate site-specific passwords.
                  </li>
                  <li>
                    Implemented AES encryption, Nostr relay backups, and deterministic identity generation for full local and encrypted cloud sync.
                  </li>
                  <li>
                    Focused on privacy-first UX using JavaScript, CryptoJS, and elliptic libraries.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold">Market Research Trainee</h3>
                <p className="text-muted-foreground">Dandelion Labs | Mar 2023 – Sept 2023</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>
                    Conducted research on blockchain trends and decentralized social networks to support strategic product and innovation decisions.
                  </li>
                  <li>
                    Prepared insights and competitive analysis to guide product design for emerging decentralized applications.
                  </li>
                  <li>
                    Explored Nostr protocol, user feedback loops, and market segmentation across Asia and Latin America.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Education</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Master of Science in Computer Science</h3>
                <p className="text-muted-foreground">University of Technology | 2019</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Bachelor of Science in Software Engineering</h3>
                <p className="text-muted-foreground">State University | 2017</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">JavaScript</Badge>
              <Badge variant="default">TypeScript</Badge>
              <Badge variant="default">React</Badge>
              <Badge variant="default">Next.js</Badge>
              <Badge variant="default">Node.js</Badge>
              <Badge variant="default">Express.js</Badge>
              <Badge variant="default">PostgreSQL</Badge>
              <Badge variant="default">MongoDB</Badge>
              <Badge variant="default">Docker</Badge>
              <Badge variant="default">AWS</Badge>
              <Badge variant="default">Git</Badge>
              <Badge variant="default">Nostr</Badge>
              <Badge variant="default">Blockchain</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
