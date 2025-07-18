export interface Comment {
  id: string
  postId: string
  author: string
  email?: string
  content: string
  createdAt: string
}

export function getComments(postId: string): Comment[] {
  if (typeof window === "undefined") return []

  const saved = localStorage.getItem(`comments_${postId}`)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (error) {
      console.error("Failed to parse comments:", error)
      return []
    }
  }
  return []
}

export function addComment(comment: Comment): void {
  if (typeof window === "undefined") return

  const existing = getComments(comment.postId)
  const updated = [...existing, comment]
  localStorage.setItem(`comments_${comment.postId}`, JSON.stringify(updated))
}

export function getAllComments(): Comment[] {
  if (typeof window === "undefined") return []

  const comments: Comment[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith("comments_")) {
      const postComments = getComments(key.replace("comments_", ""))
      comments.push(...postComments)
    }
  }
  return comments
}
