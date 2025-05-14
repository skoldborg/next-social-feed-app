'use client'

import { PostCard } from '@/components/PostCard'
import Link from 'next/link'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchPosts } from '@/lib/features/posts/postsSlice'
import { PostListSkeleton } from './PostListSkeleton'

export const PostList = () => {
  const dispatch = useAppDispatch()
  const { posts, loading, error } = useAppSelector((state) => state.posts)

  useEffect(() => {
    dispatch(fetchPosts())
  }, [dispatch])

  if (loading) return <PostListSkeleton />
  if (error) return <p>We encountered an error: {error}</p>

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href="">
            <PostCard {...post} />
          </Link>
        </li>
      ))}
    </ul>
  )
}
