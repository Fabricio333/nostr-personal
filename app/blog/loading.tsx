import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="mb-8 h-10 w-64 rounded bg-muted"></div> {/* Title placeholder */}
        <div className="mb-6 flex space-x-4">
          <div className="h-8 w-24 rounded bg-muted"></div> {/* Search input placeholder */}
          <div className="h-8 w-24 rounded bg-muted"></div> {/* Filter button placeholder */}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 rounded bg-muted"></div> {/* Badge placeholder */}
                <div className="h-6 w-3/4 rounded bg-muted mt-2"></div> {/* Title placeholder */}
                <div className="h-4 w-1/2 rounded bg-muted mt-1"></div> {/* Description placeholder */}
              </CardHeader>
              <CardContent>
                <div className="h-32 w-full rounded bg-muted mb-3"></div> {/* Image placeholder */}
                <div className="h-4 w-full rounded bg-muted mb-2"></div> {/* Content line 1 */}
                <div className="h-4 w-5/6 rounded bg-muted"></div> {/* Content line 2 */}
                <div className="mt-4 flex justify-between">
                  <div className="h-4 w-20 rounded bg-muted"></div> {/* Views/Comments placeholder */}
                  <div className="h-8 w-24 rounded bg-muted"></div> {/* Read More button placeholder */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
