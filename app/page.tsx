import { PostCard } from '@/components/PostCard'
import Link from 'next/link'
import { getPostsAction } from './actions'

export default async function Home() {
  const posts = await getPostsAction()

  return (
    <div className="max-w-lg m-auto">
      <h1 className="text-3xl font-bold mb-8">Feed</h1>
      <ul>
        {posts.map((post, i) => (
          <li key={i}>
            <Link href="">
              <PostCard {...post} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
