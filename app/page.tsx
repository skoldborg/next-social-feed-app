import { PostList } from '@/components/PostList'

export default async function Home() {
  return (
    <div className="max-w-lg m-auto">
      <h1 className="text-3xl font-bold mb-8">Feed</h1>
      <PostList />
    </div>
  )
}
