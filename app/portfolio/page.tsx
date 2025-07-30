import { CardDescription } from "@/components/ui/card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink } from "lucide-react"

export default function PortfolioPage() {
  const projects = [
    {
      id: "1",
      title: "Decentralized Chat App",
      description:
        "A real-time chat application built on a decentralized network, ensuring privacy and censorship-resistance.",
      tags: ["Web3", "React", "Nostr", "TypeScript"],
      github: "#",
      live: "#",
      image: "/placeholder.png?height=200&width=400",
    },
    {
      id: "2",
      title: "AI-Powered Content Generator",
      description: "A tool that leverages AI models to generate creative content, from blog posts to marketing copy.",
      tags: ["AI", "Python", "Next.js", "Machine Learning"],
      github: "#",
      live: "#",
      image: "/placeholder.png?height=200&width=400",
    },
    {
      id: "3",
      title: "E-commerce Platform",
      description:
        "A full-stack e-commerce solution with user authentication, product management, and secure payment processing.",
      tags: ["Next.js", "Stripe", "PostgreSQL", "Tailwind CSS"],
      github: "#",
      live: "#",
      image: "/placeholder.png?height=200&width=400",
    },
    {
      id: "4",
      title: "Personal Finance Tracker",
      description:
        "An intuitive web application to track income, expenses, and investments, helping users manage their finances effectively.",
      tags: ["React", "Node.js", "MongoDB", "Data Visualization"],
      github: "#",
      live: "#",
      image: "/placeholder.png?height=200&width=400",
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">My Portfolio</h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        A collection of my work, showcasing various technologies and problem-solving approaches.
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <img
                src={project.image || "/placeholder.png"}
                alt={project.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
              <CardDescription className="line-clamp-3">{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                {project.github && (
                  <Button asChild variant="outline" size="sm">
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                {project.live && (
                  <Button asChild size="sm">
                    <a href={project.live} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No portfolio projects to display yet. Check back soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
