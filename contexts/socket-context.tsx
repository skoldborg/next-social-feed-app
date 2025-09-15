'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { socket } from '@/lib/socket'
import { Post } from '@/lib/types'
import {
  addHighlight,
  isDuplicatePost,
  showNewPostToast,
} from '@/utils/post-utils'

interface SocketContextType {
  newPostIds: Set<string>
}
const SocketContext = createContext<SocketContextType>({
  newPostIds: new Set(),
})

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const posts = [] as unknown as Post[]
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleNewPost = (newPost: Post) => {
      if (!isDuplicatePost(posts, newPost)) {
        // Dispatch the new post to Redux
        // dispatch(addNewPost(newPost))

        // Show a toast notification
        showNewPostToast(newPost)
      }
      // Add the post ID to the highlight set
      addHighlight(setNewPostIds, newPost.id)
    }

    socket.on('new post', handleNewPost)

    return () => {
      socket.off('new post', handleNewPost)
    }
  }, [posts])

  return (
    <SocketContext.Provider value={{ newPostIds }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}
