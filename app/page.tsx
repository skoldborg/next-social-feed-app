import { PostForm } from '@/components/PostForm'
import { PostList } from '@/components/PostList'
import { getPostsAction } from './actions'
import { getQueryClient } from '@/lib/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

const INITIAL_POSTS_LIMIT = 20

export default async function Home() {
  const queryClient = getQueryClient()
  const initialPosts = await getPostsAction({
    page: 1,
    limit: INITIAL_POSTS_LIMIT,
  })

  void queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: () => getPostsAction({ page: 1 }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="max-w-lg m-auto">
        <PostList initialPosts={initialPosts} />
      </div>

      <div className="fixed bottom-4 right-4 bg-zinc-800 p-2 rounded-lg">
        <h2 className="font-bold mb-4 ml-2">Be social - Add your own post!</h2>
        <PostForm />
      </div>
    </HydrationBoundary>
  )
}
