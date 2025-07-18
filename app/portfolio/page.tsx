"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Calendar } from "lucide-react"
import Image from "next/image"

const projects = [
  {
    id: 1,
    title: "E-commerce Platform",
    description:
      "A full-stack e-commerce solution built with Next.js, featuring user authentication, payment processing, and admin dashboard.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["Next.js", "TypeScript", "Stripe", "PostgreSQL", "Tailwind CSS"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example/ecommerce",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Task Management App",
    description:
      "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Material-UI"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example/taskapp",
    date: "2023-11-20",
  },
  {
    id: 3,
    title: "Weather Dashboard",
    description:
      "A responsive weather dashboard that displays current conditions, forecasts, and weather maps using multiple APIs.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["Vue.js", "Chart.js", "OpenWeather API", "CSS Grid"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example/weather",
    date: "2023-09-10",
  },
  {
    id: 4,
    title: "Blog CMS",
    description:
      "A headless content management system for blogs with markdown support, SEO optimization, and multi-author capabilities.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["Gatsby", "GraphQL", "Contentful", "Netlify"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example/blog-cms",
    date: "2023-07-05",
  },
]

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Portfolio</h1>
        <p className="text-xl text-muted-foreground">A showcase of my recent projects and technical work.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden">
              <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{project.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    Code
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Skills & Technologies</CardTitle>
            <CardDescription>Technologies and tools I work with regularly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Frontend</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>React / Next.js</div>
                  <div>TypeScript</div>
                  <div>Tailwind CSS</div>
                  <div>Vue.js</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Node.js</div>
                  <div>Python</div>
                  <div>PostgreSQL</div>
                  <div>MongoDB</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tools</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Git</div>
                  <div>Docker</div>
                  <div>AWS</div>
                  <div>Vercel</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Design</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Figma</div>
                  <div>Adobe XD</div>
                  <div>Sketch</div>
                  <div>Photoshop</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
