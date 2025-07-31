import { CardDescription } from "@/components/ui/card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ProjectsPage() {
  const projects = [
    {
      id: "1",
      title: "WeAreBitcoin.org",
      shortDescription:
        "Bitcoin education platform focused on self-custody and sound money principles.",
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
      link: "/projects/wearebitcoin",
    },
    {
      id: "2",
      title: "Web WorkOut Timer",
      shortDescription:
        "Customizable web timer for managing workout and rest intervals.",
      description:
        "A simple browser-based timer that lets users configure exercise and break periods for workouts.",
      responsibilities: [
        "Designed intuitive controls for setting exercise and rest durations.",
        "Implemented start, pause, and reset actions with audio alerts.",
      ],
      tags: ["JavaScript", "Fitness", "Timer"],
      github: "https://github.com/fabricio333/WebWorkOutTimer",
      live: "https://fabricio333.github.io/WebWorkOutTimer/",
      emoji: "🏋️",
      link: "/projects/webworkouttimer",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Projects</h1>
      <p className="text-lg text-muted-foreground text-center mb-6">
        A collection of my work, showcasing various technologies and problem-solving approaches.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
              <Link href={project.link}>
                {project.emoji ? (
                  <div className="w-full aspect-square flex items-center justify-center rounded-md mb-2 text-6xl">
                    {project.emoji}
                  </div>
                ) : (
                  <Image
                    src={project.image || "/placeholder.png"}
                    alt={project.title}
                    width={256}
                    height={256}
                    className="w-full aspect-square object-cover rounded-md mb-2"
                  />
                )}
              </Link>
              <CardTitle className="text-xl mb-1">{project.title}</CardTitle>
              <CardDescription className="mb-2">
                <Link href={project.link} className="hover:underline">
                  {project.shortDescription}
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-2 mb-2">
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

