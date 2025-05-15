'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { PostCard } from '@/components/PostCard'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchPosts } from '@/lib/features/posts/postsSlice'
import { PostListSkeleton } from './PostListSkeleton'
import { Error } from './Error'

export const PostList = () => {
  const dispatch = useAppDispatch()
  const { posts, loading, error } = useAppSelector((state) => state.posts)

  useEffect(() => {
    dispatch(fetchPosts())
  }, [dispatch])

  if (loading) return <PostListSkeleton />
  if (error) return <Error error={error} />

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/posts/${post.id}`}>
            <PostCard {...post} />
          </Link>
        </li>
      ))}
    </ul>
  )
}
