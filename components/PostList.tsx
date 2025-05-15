'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { PostCard } from '@/components/PostCard'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchPosts } from '@/lib/features/posts/postsSlice'
import { PostListSkeleton } from './PostListSkeleton'
import { useSocket } from '@/hooks/useSocket'
import { Error } from './Error'

export const PostList = () => {
  const { newPost } = useSocket()
  const dispatch = useAppDispatch()
  const { posts, loading, error } = useAppSelector((state) => state.posts)

  useEffect(() => {
    dispatch(fetchPosts())
  }, [dispatch])

  useEffect(() => {
    if (newPost) toast(`${newPost.author} added a new post!`)
  }, [newPost])

  if (loading) return <PostListSkeleton />
  if (error) return <Error error={error} />

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
