import type { Post } from '@/lib/types'
import { JSONFilePreset } from 'lowdb/node'

type Data = {
  posts: Post[]
}

const defaultData: Data = { posts: [] }

export const getDb = async () => {
  const db = await JSONFilePreset<Data>('db.json', defaultData)
  return db
}

export const addPost = async (post: Post) => {
  const db = await getDb()
  db.data.posts.unshift(post)
  await db.write()
}

export const getPosts = async (offset: number, limit: number) => {
  const db = await getDb()

  return db.data.posts.slice(offset, offset + limit)
}

export const getSinglePost = async (id: string) => {
  const db = await getDb()
  const post = db.data.posts.find((post) => post.id === id)

  if (!post) {
    return null
  }

  return post
}
