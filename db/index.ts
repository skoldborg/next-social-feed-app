import type { Post } from '@/lib/types'
import { JSONFilePreset } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'

export type PostWithMetaData = Post & {
  id: string
  createdAt: string
}

type Data = {
  posts: PostWithMetaData[]
}

export const addMetaData = (post: Post): PostWithMetaData => {
  return {
    ...post,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
}

const defaultData: Data = { posts: [] }

export const getDb = async () => {
  const db = await JSONFilePreset<Data>('db.json', defaultData)
  return db
}

export const addPost = async (post: Post) => {
  const db = await getDb()
  db.data.posts.push(addMetaData(post))
  await db.write()
}

export const getPosts = async () => {
  const db = await getDb()
  return db.data.posts
}
