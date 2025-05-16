import { addNewPost } from '@/lib/features/posts/postsSlice'
import { useAppDispatch } from '@/lib/hooks'
import { socket } from '@/lib/socket'
import { Post } from '@/lib/types'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export const useNewPostListener = (posts: Post[]) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleNewPost = (newPost: Post) => {
      const postExists = posts.some((post) => post.id === newPost.id)

      if (!postExists) {
        // Show a toast notification for all clients except the one that posted
        toast(`${newPost.author} added a new post!`)

        // Add new post to the store so it's shown to both sender and other clients
        dispatch(addNewPost(newPost))
      }
    }

    socket.on('new post', handleNewPost)

    return () => {
      socket.off('new post', handleNewPost)
    }
  }, [dispatch, posts])
}
