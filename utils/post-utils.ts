import { Post } from '@/lib/types'
import toast from 'react-hot-toast'

// Show a toast notification for the new post
export const showNewPostToast = (newPost: Post) => {
  toast(`${newPost.author} added a new post!`)
}

// Add the new post ID to the highlight set
export const addHighlight = (
  setNewPostIds: React.Dispatch<React.SetStateAction<Set<string>>>,
  newPostId: string
) => {
  setNewPostIds((prev) => {
    const updated = new Set(prev)
    updated.add(newPostId)
    return updated
  })

  // Remove the highlight after 5 seconds
  setTimeout(() => {
    setNewPostIds((prev) => {
      const updated = new Set(prev)
      updated.delete(newPostId)
      return updated
    })
  }, 2000)
}
