import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Linkedin, Github } from "lucide-react"
import { getSiteName } from "@/lib/settings"

export default async function ResumePage() {
  const name = await getSiteName()
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2">{name}</CardTitle>
          <p className="text-lg text-muted-foreground">
            Finance Student | Economics &amp; Business Enthusiast
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Buenos Aires, Argentina</span>
            </div>
            <div className="flex items-center gap-1">
              <Linkedin className="h-4 w-4" />
              <a
                href="https://linkedin.com/in/fabricio-acosta-ok"
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
                href="https://github.com/Fabricio333"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
            </div>
          </div>
        </CardHeader>

        <Separator className="my-8" />

        <CardContent className="space-y-8">
          <section className="grid gap-8 md:grid-cols-2">
            {/* Professional Profile */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Professional Profile</h2>
              <p className="text-muted-foreground">
                Finance student passionate about economics and business. One of my strengths is my curiosity, which has
                allowed me to learn and understand various topics over the past few years, from hardware development to
                programming trading bots, data analysis, and cybersecurity tool development. This enables me to find
                holistic and creative solutions to any problem that arises. I enjoy continuous learning and working towards
                long-term goals that create a societal impact.
              </p>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Skills</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Tech skills</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Cryptographic Tools</Badge>
                    <Badge variant="default">Python</Badge>
                    <Badge variant="default">JavaScript</Badge>
                    <Badge variant="default">Local AI Models</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Soft skills</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Problem-solving</Badge>
                    <Badge variant="default">Effective Communication</Badge>
                    <Badge variant="default">Teamwork</Badge>
                    <Badge variant="default">Continuous Learning &amp; Adaptability</Badge>
                    <Badge variant="default">Attention to Detail</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Spanish (Native)</Badge>
                    <Badge variant="default">English (Bilingual)</Badge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section className="grid gap-8 md:grid-cols-2">
            {/* Education */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Education</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Bachelor’s Degree in Finance</h3>
                  <p className="text-muted-foreground">
                    Universidad Argentina de la Empresa (UADE), Buenos Aires (2023 - Present)
                  </p>
                  <p className="text-muted-foreground">Second Year – 19/40 Courses Completed</p>
                </div>
              </div>
            </div>

            {/* Courses & Certifications */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Courses &amp; Certifications</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>English, White Castle (2021–2023)</p>
                <p>Python For Everybody, Coursera (2021)</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Professional Experience */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Professional Experience</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold">
                  Content Writer – WeAreBitcoin.org
                </h3>
                <p className="text-muted-foreground">Mar 2025 – Present | Remote – Buenos Aires, Argentina</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Bitcoin education platform focused on self-custody and sound money principles.</li>
                  <li>Write, translate, and localize articles on Bitcoin, Austrian economics, and self-sovereignty.</li>
                  <li>Format and publish posts using Markdown and a Next.js-based CMS.</li>
                  <li>Design and test interactive tools (e.g., onboarding wizards, DCA calculators).</li>
                  <li>Optimize content for SEO with clear headlines, metadata, and accessibility improvements.</li>
                  <li>Collaborate on visual layout and UX to enhance learning and engagement.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Junior Blockchain Market Researcher – DandelionLabs
                </h3>
                <p className="text-muted-foreground">Mar 2023 – Sept 2023</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Conducted market and trend analysis in blockchain technology and decentralized social networks.</li>
                  <li>Evaluated emerging blockchain projects and decentralized social platforms.</li>
                  <li>Researched security protocols for cryptocurrency operations.</li>
                  <li>Created reports with key insights to support strategic decisions.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Trainee – Granja.3D</h3>
                <p className="text-muted-foreground">2019 – 2021</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Product design and prototyping studio.</li>
                  <li>Maintained and operated 3D printers and laser engravers.</li>
                  <li>Developed electronics for hydroponics, audio devices, and CNC milling.</li>
                  <li>Collaborated with users and production teams to build custom solutions.</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          {/* Notable Projects */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Notable Projects</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold">
                  Local Language Models for Private Data Analysis
                </h3>
                <p className="text-muted-foreground">Mar 2025 – Present</p>
                <p className="text-muted-foreground">
                  Configured local LLMs to process private data securely. Technologies: Local AI models, NLP.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Fine-tuning AI for Specialized Knowledge</h3>
                <p className="text-muted-foreground">Mar 2025</p>
                <p className="text-muted-foreground">
                  Trained AI with domain-specific datasets for improved contextual understanding. Technologies: LLaMA 3.1
                  7B, RAG, Ollama.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Offline &amp; Multi-Device Password Manager
                </h3>
                <p className="text-muted-foreground">Dec 2024 – Jan 2025</p>
                <p className="text-muted-foreground">
                  Built an offline-first password manager with QR-based data exchange and secure deterministic key
                  generation. Technologies: JavaScript, cryptography, HTML/CSS, QR scanning.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">n8n Workflows for Automation &amp; Integration</h3>
                <p className="text-muted-foreground">Jul 2024 – Present</p>
                <p className="text-muted-foreground">
                  Designed automated workflows to integrate APIs, databases, and AI tools using the n8n open-source
                  automation platform. Created Telegram bots, Google Sheets syncs, and content pipelines. Built logic for
                  secure user state handling, notifications, and custom endpoints. Technologies: n8n, Webhooks, MongoDB,
                  PostgreSQL, Telegram API, JSON, Cloudflare Tunnels.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Personal Knowledge Management System</h3>
                <p className="text-muted-foreground">Apr 2023 – Present</p>
                <p className="text-muted-foreground">
                  Used Obsidian.md for structured note-taking and personal knowledge base. Technologies: Markdown,
                  Obsidian plugins.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Algorithmic Trading – Backtesting Scripts</h3>
                <p className="text-muted-foreground">Apr 2021 – Apr 2022</p>
                <p className="text-muted-foreground">
                  Developed grid trading strategies and backtesting tools. Technologies: Python, API integrations.
                </p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

