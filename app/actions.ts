'use server'

import { addPost, getPosts } from '@/db/index'
import { Post } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const PostSchema = z.object({
  author: z.string().min(3, 'Author is required'),
  content: z.string().min(1, 'Content is required'),
  avatar: z.string().optional(),
})

export type ActionResponse = {
  success: boolean
  message: string
  post?: Post
  errors?: Record<string, string[]>
  error?: string
}

export async function getPostsAction() {
  try {
    const posts = await getPosts()
    return posts
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    throw new Error('Failed to fetch posts')
  }
}

export async function addPostAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const author = formData.get('author') as string
    const content = formData.get('content') as string
    const avatarFile = formData.get('avatar') as File

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

    let avatarBase64: string | undefined = undefined
    // Convert the avatar image to a Base64 string
    if (avatarFile) {
      avatarBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(avatarFile)
      })
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
