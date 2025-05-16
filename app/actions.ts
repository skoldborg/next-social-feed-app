'use server'

import { addPost, getPosts, getSinglePost } from '@/db/index'
import { Pagination, Post } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const PostSchema = z.object({
  author: z.string().min(3, 'Author is required'),
  content: z.string().min(1, 'Content is required'),
  avatar: z.instanceof(File).optional(),
})

export type ActionResponse = {
  success: boolean
  message: string
  post?: Post
  errors?: Record<string, string[]>
  error?: string
}

export async function getPostsAction({ page, limit }: Pagination) {
  try {
    const offset = (page - 1) * limit

    const posts = await getPosts(offset, limit)
    return posts
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    throw new Error('Failed to fetch posts')
  }
}

export async function getSinglePostAction(id: string) {
  try {
    const post = await getSinglePost(id)
    return post
  } catch (error) {
    console.error('Failed to fetch post:', error)
    throw new Error('Failed to fetch post')
  }
}

export async function addPostAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const author = formData.get('author') as string
    const content = formData.get('content') as string
    const avatar = formData.get('avatar') as File
    const avatarFile =
      avatar instanceof File && avatar.size > 0 ? avatar : undefined

    // Validate input using Zod schema
    const validationResult = PostSchema.safeParse({
      author,
      content,
      avatar: avatarFile,
    })
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    // Base64 used for simplicity
    // In a real-world application, I'd upload the file to a server or cloud storage
    // and store the URL instead of the Base64 string
    let avatarBase64: string | undefined = undefined
    // Convert the avatar image to a Base64 string
    if (avatarFile) {
      const arrayBuffer = await avatarFile.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      avatarBase64 = `data:${avatarFile.type};base64,${base64}`
    }

    const post = {
      id: uuidv4(),
      author,
      content,
      avatar: avatarBase64,
    }

    await addPost(post)

    return {
      success: true,
      message: 'Post added successfully',
      post,
    }
  } catch (error) {
    console.error('Failed to add post:', error)
    return {
      success: false,
      message: 'An error occurred while adding the post',
      error: 'Failed to add post',
    }
  }
}
