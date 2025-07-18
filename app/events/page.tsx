"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Users, ExternalLink } from "lucide-react"

const events = [
  {
    id: 1,
    title: "React Conference 2024",
    description: "Speaking about 'Building Scalable React Applications' at the annual React Conference.",
    date: "2024-03-15",
    time: "14:00",
    location: "San Francisco, CA",
    type: "Speaking",
    status: "upcoming",
    attendees: 500,
    url: "https://reactconf.com",
  },
  {
    id: 2,
    title: "Local Tech Meetup",
    description: "Monthly meetup discussing latest trends in web development and networking with local developers.",
    date: "2024-02-20",
    time: "18:30",
    location: "Downtown Community Center",
    type: "Attending",
    status: "upcoming",
    attendees: 50,
    url: "https://meetup.com/local-tech",
  },
  {
    id: 3,
    title: "JavaScript Workshop",
    description: "Conducted a hands-on workshop on modern JavaScript features and best practices.",
    date: "2024-01-10",
    time: "10:00",
    location: "Tech Hub",
    type: "Teaching",
    status: "past",
    attendees: 30,
    url: "https://techhub.com/workshops",
  },
  {
    id: 4,
    title: "Open Source Contribution Day",
    description: "Participated in a community event focused on contributing to open source projects.",
    date: "2023-12-05",
    time: "09:00",
    location: "Virtual Event",
    type: "Participating",
    status: "past",
    attendees: 200,
    url: "https://opensource-day.org",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "upcoming":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "past":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "Speaking":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "Teaching":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "Attending":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

export default function EventsPage() {
  const upcomingEvents = events.filter((event) => event.status === "upcoming")
  const pastEvents = events.filter((event) => event.status === "past")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Events</h1>
        <p className="text-xl text-muted-foreground">
          Speaking engagements, workshops, and community events I'm involved in.
        </p>
      </div>

      {/* Upcoming Events */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Upcoming Events
        </h2>

        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No upcoming events scheduled.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                      <CardDescription className="text-base">{event.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                      <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees} attendees</span>
                    </div>
                    <Button size="sm" asChild>
                      <a href={event.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Learn More
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Past Events</h2>

        <div className="grid gap-6">
          {pastEvents.map((event) => (
            <Card key={event.id} className="opacity-75 hover:opacity-100 transition-opacity">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                    <CardDescription className="text-base">{event.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                    <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} attendees</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={event.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
