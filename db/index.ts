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

export const getPosts = async () => {
  const db = await getDb()

  return db.data.posts
}
