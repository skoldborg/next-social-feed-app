import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { ActionResponse, addPostAction, getPostsAction } from '@/app/actions'
import { Post } from './types'

function useGetPosts(initialData: Post[]) {
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

function useAddPost() {
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

export { useAddPost, useGetPosts }
