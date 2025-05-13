'use server'

import { getPosts } from '@/db/index'

export async function getPostsAction() {
  try {
    const posts = await getPosts()
    return posts
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    throw new Error('Failed to fetch posts')
  }
}
