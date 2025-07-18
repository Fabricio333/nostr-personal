"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react"

const resumeData = {
  personalInfo: {
    name: "John Doe",
    title: "Full Stack Developer",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
  },
  summary:
    "Passionate full-stack developer with 5+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies. Strong advocate for clean code, testing, and user-centered design.",
  experience: [
    {
      company: "Tech Startup Inc.",
      position: "Senior Full Stack Developer",
      duration: "2022 - Present",
      location: "San Francisco, CA",
      achievements: [
        "Led development of a microservices architecture serving 100K+ daily users",
        "Reduced application load time by 40% through performance optimization",
        "Mentored 3 junior developers and established code review processes",
        "Implemented CI/CD pipeline reducing deployment time by 60%",
      ],
    },
    {
      company: "Digital Agency Co.",
      position: "Full Stack Developer",
      duration: "2020 - 2022",
      location: "Remote",
      achievements: [
        "Built 15+ client websites using React, Next.js, and various CMS platforms",
        "Developed custom e-commerce solutions processing $2M+ in transactions",
        "Collaborated with design team to implement pixel-perfect UI components",
        "Maintained 99.9% uptime across all client applications",
      ],
    },
    {
      company: "Software Solutions Ltd.",
      position: "Junior Developer",
      duration: "2019 - 2020",
      location: "New York, NY",
      achievements: [
        "Contributed to legacy system modernization using React and Node.js",
        "Fixed 200+ bugs and implemented 50+ new features",
        "Participated in agile development process and daily standups",
        "Wrote comprehensive unit tests achieving 85% code coverage",
      ],
    },
  ],
  education: [
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science in Computer Science",
      duration: "2015 - 2019",
      gpa: "3.8/4.0",
    },
  ],
  skills: {
    Frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js"],
    Backend: ["Node.js", "Python", "Express.js", "FastAPI", "GraphQL"],
    Database: ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
    "Cloud & DevOps": ["AWS", "Docker", "Kubernetes", "Vercel", "GitHub Actions"],
    Tools: ["Git", "Figma", "Postman", "Jest", "Cypress"],
  },
  certifications: [
    "AWS Certified Solutions Architect",
    "Google Cloud Professional Developer",
    "MongoDB Certified Developer",
  ],
}

export default function ResumePage() {
  const handleDownload = () => {
    // In a real application, this would download a PDF version
    alert("PDF download would be implemented here")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{resumeData.personalInfo.name}</h1>
              <p className="text-xl text-muted-foreground mb-4">{resumeData.personalInfo.title}</p>
            </div>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a href={`mailto:${resumeData.personalInfo.email}`} className="hover:underline">
                {resumeData.personalInfo.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{resumeData.personalInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{resumeData.personalInfo.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <a
                href={resumeData.personalInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Portfolio
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{resumeData.summary}</p>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {resumeData.experience.map((job, index) => (
              <div key={index} className="border-l-2 border-primary/20 pl-6 relative">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-2"></div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{job.position}</h3>
                    <p className="text-primary font-medium">{job.company}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{job.duration}</div>
                    <div>{job.location}</div>
                  </div>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  {job.achievements.map((achievement, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-primary">{edu.institution}</p>
                  <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                </div>
                <div className="text-sm text-muted-foreground">{edu.duration}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technical Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(resumeData.skills).map(([category, skills]) => (
                <div key={category}>
                  <h4 className="font-semibold mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resumeData.certifications.map((cert, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
