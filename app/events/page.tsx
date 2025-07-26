import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Ticket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EventsPage() {
  const events = [
    {
      id: "1",
      title: "Nostr Meetup NYC",
      date: "2024-08-15",
      time: "6:00 PM - 9:00 PM",
      location: "The Bitcoin Commons, NYC",
      description: "Join fellow Nostr enthusiasts for a casual meetup, discussions, and networking.",
      tags: ["nostr", "meetup", "nyc"],
      link: "#",
    },
    {
      id: "2",
      title: "Decentralized Web Conference",
      date: "2024-09-20",
      time: "9:00 AM - 5:00 PM",
      location: "Online (Virtual)",
      description: "A conference exploring the latest in decentralized web technologies, including Nostr.",
      tags: ["conference", "web3", "online"],
      link: "#",
    },
    {
      id: "3",
      title: "Bitcoin & Privacy Workshop",
      date: "2024-10-05",
      time: "10:00 AM - 4:00 PM",
      location: "Austin, TX",
      description: "Hands-on workshop on Bitcoin privacy techniques and self-custody.",
      tags: ["bitcoin", "privacy", "workshop"],
      link: "#",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Upcoming Events</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <Badge variant="secondary">{new Date(event.date).getFullYear()}</Badge>
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                at {event.time}
              </p>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.location}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-3">{event.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button asChild size="sm">
                  <Link href={event.link}>
                    <Ticket className="mr-2 h-4 w-4" />
                    Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No upcoming events at the moment. Check back soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
