'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Post } from '@/lib/types'
import { addHighlight, showNewPostToast } from '@/utils/post-utils'
import { socket } from '@/lib/socket'

interface SocketContextType {
  newPostIds: Set<string>
}
const SocketContext = createContext<SocketContextType>({
  newPostIds: new Set(),
})

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set())
  const seenPostIdsRef = useRef<Set<string>>(new Set())
  const queryClient = useQueryClient()

  useEffect(() => {
    const initialData = queryClient.getQueryData(['posts']) as
      | { pages: Post[][] }
      | undefined
    if (initialData?.pages) {
      const initialIds = new Set(
        initialData.pages.flat().map((post: Post) => post.id)
      )
      seenPostIdsRef.current = initialIds
    }

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type !== 'updated') return
      const query = event.query
      if (
        !query ||
        query.queryKey[0] !== 'posts' ||
        query.queryKey.length !== 1
      )
        return

      const data = query.state.data as { pages: Post[][] } | undefined
      if (!data?.pages) return

      const allPosts = data.pages.flat()
      const currentIds = new Set(allPosts.map((p) => p.id))

      const newlyAddedPosts = allPosts.filter(
        (p) => !seenPostIdsRef.current.has(p.id)
      )

      if (newlyAddedPosts.length > 0) {
        newlyAddedPosts.forEach((newPost) => {
          showNewPostToast(newPost)
          addHighlight(setNewPostIds, newPost.id)
        })
      }

      seenPostIdsRef.current = currentIds
    })

    return () => {
      unsubscribe()
    }
  }, [queryClient])

  useEffect(() => {
    const handleNewPost = (newPost: Post) => {
      if (seenPostIdsRef.current.has(newPost.id)) return

      showNewPostToast(newPost)
      addHighlight(setNewPostIds, newPost.id)

      // Mark as seen to avoid double-toast when query cache updates
      const updated = new Set(seenPostIdsRef.current)
      updated.add(newPost.id)
      seenPostIdsRef.current = updated
    }

    socket.on('new post', handleNewPost)

    return () => {
      socket.off('new post', handleNewPost)
    }
  }, [])

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
