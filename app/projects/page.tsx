import { CardDescription } from "@/components/ui/card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink } from "lucide-react"

export default function ProjectsPage() {
  const projects = [
    {
      id: "1",
      title: "WeAreBitcoin.org",
      description:
        "Content Writer and Developer at WeAreBitcoin.org, a Bitcoin education platform focused on self-custody and sound money principles.",
      responsibilities: [
        "Write, translate, and localize articles on Bitcoin, Austrian economics, and self-sovereignty.",
        "Format and publish posts using Markdown and a Next.js-based CMS.",
        "Design and test interactive tools such as onboarding wizards and DCA calculators.",
        "Optimize content for SEO and clarity with strategic headlines and metadata.",
        "Collaborate on visual layouts and UX to enhance engagement and learning.",
      ],
      tags: ["Bitcoin", "Content", "Next.js", "Education"],
      github: "https://github.com/we-are-bitcoin",
      live: "https://wearebitcoin.org",
      image: "/wab.png",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Projects</h1>
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
              <CardDescription className="mb-4">
                {project.description}
              </CardDescription>
              {project.responsibilities && (
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {project.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
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
            <p className="text-muted-foreground">No projects to display yet. Check back soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

