'use client'

import Link from 'next/link'
import React, { useEffect } from 'react'
import cx from 'classnames'
import { PostCard } from '@/components/PostCard'
import { useInView } from 'react-intersection-observer'
import { Post } from '@/lib/types'
import { useGetPosts, usePostsRealtime } from '@/lib/hooks'
import { PostListSkeleton } from './PostListSkeleton'

export const PostList = ({ initialPosts }: { initialPosts: Post[] }) => {
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useGetPosts(initialPosts)
  const { ref, inView } = useInView()

  const { newPostIds } = usePostsRealtime()

  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage])

  // if (error) return <Error error={error} />

  return (
    <>
      <ul>
        {data.pages.map((group, i) => (
          <React.Fragment key={i}>
            {group?.map((post) => (
              <li
                key={post.id}
                className={cx('transition-all duration-500', {
                  'animate-pulse': newPostIds.has(post.id),
                })}
              >
                <Link href={`/post/${post.id}`}>
                  <PostCard {...post} />
                </Link>
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>
      {isFetchingNextPage && <PostListSkeleton />}
      {hasNextPage && <div ref={ref} className="h-10" />}
    </>
  )
}
