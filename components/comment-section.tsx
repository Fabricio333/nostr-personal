"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MessageCircle, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { addComment, type Comment } from "@/lib/comments"

interface CommentSectionProps {
  postId: string
  initialComments?: Comment[]
}

export function CommentSection({ postId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const { toast } = useToast()

  const handleAddComment = async () => {
    if (newComment.trim() === "") {
      toast({
        title: "Error",
        description: "Comment cannot be empty.",
        variant: "destructive",
      })
      return
    }

    try {
      const comment: Comment = {
        id: `temp-${Date.now()}`, // Temporary ID
        postId,
        author: "You", // Placeholder for current user
        content: newComment.trim(),
        timestamp: Date.now() / 1000,
      }
      setComments((prev) => [comment, ...prev])
      setNewComment("")

      // Simulate API call to add comment
      await addComment(comment)

      toast({
        title: "Comment Added!",
        description: "Your comment has been posted.",
      })
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
      setComments(initialComments) // Revert if failed
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Textarea
            placeholder="Write your comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="mb-2"
          />
          <Button onClick={handleAddComment} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Post Comment
          </Button>
        </div>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.png" alt={comment.author} />
                  <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Comments are powered by Nostr (simulated for now).
      </CardFooter>
    </Card>
  )
}
