'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import cx from 'classnames'
import { PostCard } from '@/components/PostCard'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchPosts } from '@/lib/features/posts/postsSlice'
import { PostListSkeleton } from './PostListSkeleton'
import { Error } from './Error'
import { useInView } from 'react-intersection-observer'
import { Post } from '@/lib/types'
import { useSocketContext } from '@/contexts/socket-context'

const POSTS_PER_PAGE = 20

export const PostList = () => {
  const dispatch = useAppDispatch()
  const { posts, loading, error } = useAppSelector((state) => state.posts)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [page, setPage] = useState(1)
  const { ref, inView } = useInView()

  const { newPostIds } = useSocketContext()

  useEffect(() => {
    // Fetch initial set of posts
    if (page === 1 && posts.length === 0) {
      dispatch(fetchPosts({ page: 1, limit: POSTS_PER_PAGE })).then(
        (action) => {
          // If no more posts - stop fetching
          if ((action.payload as Post[]).length === 0) {
            setHasMorePosts(false)
          }
        }
      )
    }
  }, [dispatch, page, posts])

  useEffect(() => {
    if (inView && !loading) {
      // Increment page number when observer is in view
      setPage((prevPage) => prevPage + 1)
    }
  }, [inView, loading])

  useEffect(() => {
    if (page > 1) {
      // Fetch the next page of posts
      dispatch(fetchPosts({ page, limit: POSTS_PER_PAGE })).then((action) => {
        // If no more posts - stop fetching
        if ((action.payload as Post[]).length === 0) {
          setHasMorePosts(false)
        }
      })
    }
  }, [page, dispatch, hasMorePosts])

  if (loading && page === 1) return <PostListSkeleton />
  if (error) return <Error error={error} />

  return (
    <>
      <ul>
        {posts.map((post) => (
          <li
            key={post.id}
            className={cx('transition-all duration-500', {
              'animate-pulse': newPostIds.has(post.id),
            })}
          >
            <Link href={`/posts/${post.id}`}>
              <PostCard {...post} />
            </Link>
          </li>
        ))}
      </ul>
      {hasMorePosts && <div ref={ref} className="h-10" />}
    </>
  )
}
