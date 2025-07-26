export interface Comment {
  id: string
  postId: string
  author: string
  content: string
  timestamp: number
}

// In a real application, this would interact with a backend or Nostr relays
// For now, it's a simulated async function
export async function addComment(comment: Comment): Promise<Comment> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Simulating adding comment:", comment)
      resolve(comment)
    }, 500)
  })
}

export async function fetchCommentsForPost(postId: string): Promise<Comment[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Simulating fetching comments for post:", postId)
      // Return some dummy comments for demonstration
      const dummyComments: Comment[] = [
        {
          id: "comment1",
          postId,
          author: "Alice",
          content: "Great post! Very insightful.",
          timestamp: Date.now() / 1000 - 3600, // 1 hour ago
        },
        {
          id: "comment2",
          postId,
          author: "Bob",
          content: "I learned a lot from this. Thanks for sharing!",
          timestamp: Date.now() / 1000 - 7200, // 2 hours ago
        },
      ]
      resolve(dummyComments)
    }, 500)
  })
}
