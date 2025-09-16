import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { ActionResponse, addPostAction, getPostsAction } from '@/app/actions'
import { socket } from '@/lib/socket'
import { addHighlight, showNewPostToast } from '@/utils/post-utils'
import { Post } from './types'

export function useGetPosts(initialData: Post[]) {
  return useInfiniteQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 1 }) => {
      // Pass the pageParam as the page number to getPostsAction
      const page = typeof pageParam === 'number' ? pageParam : 1
      return await getPostsAction({ page })
    },
    initialData: { pages: [initialData], pageParams: [1] },
    initialPageParam: 1,
    getNextPageParam(lastPage, allPages) {
      return lastPage.length > 0 ? allPages.length + 1 : undefined
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}

export function useAddPost() {
  const queryClient = useQueryClient()

  return useMutation<ActionResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => addPostAction(formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['posts'] })
      }
    },
  })
}

// Realtime posts via socket.io, updating the query cache and exposing highlights
export function usePostsRealtime() {
  const queryClient = useQueryClient()
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set())
  // Keep track of post ids in the query cache
  const seenPostIdsRef = useRef<Set<string>>(new Set())
  // Keep track of post ids that have been notified
  const notifiedIdsRef = useRef<Set<string>>(new Set())

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

      const { query } = event
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

      seenPostIdsRef.current = currentIds
    })

    return () => {
      unsubscribe()
    }
  }, [queryClient])

  useEffect(() => {
    const handleNewPost = (newPost: Post) => {
      if (seenPostIdsRef.current.has(newPost.id)) return
      if (notifiedIdsRef.current.has(newPost.id)) return

      // Optimistically insert the new post at the top of the first page
      queryClient.setQueryData(
        ['posts'],
        (existing: { pages: Post[][] } | undefined) => {
          if (!existing?.pages || existing.pages.length === 0) {
            return { pages: [[newPost]], pageParams: [1] }
          }
          const pages = existing.pages.slice()
          pages[0] = [newPost, ...(pages[0] ?? [])]
          return { ...existing, pages }
        }
      )

      showNewPostToast(newPost)
      addHighlight(setNewPostIds, newPost.id)

      // Mark as seen to avoid clashes with the query cache
      const updated = new Set(seenPostIdsRef.current)
      updated.add(newPost.id)
      seenPostIdsRef.current = updated

      // Prevent duplicate toasts for the same post id in this session
      const notified = new Set(notifiedIdsRef.current)
      notified.add(newPost.id)
      notifiedIdsRef.current = notified
    }

    socket.on('new post', handleNewPost)
    return () => {
      socket.off('new post', handleNewPost)
    }
  }, [queryClient])

  return { newPostIds }
}
