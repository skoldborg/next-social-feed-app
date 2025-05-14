import { PostForm } from '@/components/PostForm'
import { PostList } from '@/components/PostList'

export default async function Home() {
  return (
    <>
      <div className="max-w-lg m-auto">
        <h1 className="text-3xl font-bold mb-8">Feed</h1>
        <PostList />
      </div>

      <div className="fixed bottom-4 right-4 bg-zinc-800 p-2 rounded-lg">
        <h2 className="font-bold mb-4 ml-2">Be social - Add your own post!</h2>
        <PostForm />
      </div>
    </>
  )
}
