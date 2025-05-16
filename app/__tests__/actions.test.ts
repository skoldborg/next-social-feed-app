import { mockPosts } from '@/__mocks__/post'
import * as db from '@/db/index'
import { getPosts, getSinglePost } from '@/db/index'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addPostAction, getPostsAction, getSinglePostAction } from '../actions'

vi.mock('@/db/index', async () => {
  return {
    addPost: vi.fn(),
    getPosts: vi.fn(),
    getSinglePost: vi.fn(),
  }
})

describe('actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.stubGlobal('console', {
      ...console,
      error: vi.fn(), // Suppress console.error so we don't see errors in the test output
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals() // Restore console to its original state
  })

  describe('getPostsAction', () => {
    it('should fetch posts with correct pagination', async () => {
      vi.mocked(getPosts).mockResolvedValue(mockPosts)

      const result = await getPostsAction({ page: 1, limit: 10 })

      expect(getPosts).toHaveBeenCalledWith(0, 10)
      expect(result).toEqual(mockPosts)
    })

    it('should throw an error if fetching posts fails', async () => {
      vi.mocked(getPosts).mockRejectedValue(new Error('Database error'))

      await expect(getPostsAction({ page: 1, limit: 10 })).rejects.toThrow(
        'Failed to fetch posts'
      )
    })
  })

  describe('getSinglePostAction', () => {
    it('should fetch a single post by ID', async () => {
      const mockPost = mockPosts[0]
      vi.mocked(getSinglePost).mockResolvedValue(mockPost)

      const result = await getSinglePostAction(mockPost.id)

      expect(getSinglePost).toHaveBeenCalledWith(mockPost.id)
      expect(result).toEqual(mockPost)
    })

    it('should throw an error if fetching the post fails', async () => {
      vi.mocked(getSinglePost).mockRejectedValue(new Error('Database error'))

      await expect(getSinglePostAction('1')).rejects.toThrow(
        'Failed to fetch post'
      )
    })
  })

  describe('addPostAction', () => {
    it('should successfully add a post with valid data', async () => {
      // Create a mock FormData
      const formData = new FormData()
      formData.append('author', 'John Doe')
      formData.append('content', 'Dummy content')

      const result = await addPostAction(formData)

      expect(result).toEqual({
        success: true,
        message: 'Post added successfully',
        post: {
          id: expect.any(String),
          author: 'John Doe',
          content: 'Dummy content',
        },
      })

      expect(db.addPost).toHaveBeenCalledWith({
        id: expect.any(String),
        author: 'John Doe',
        content: 'Dummy content',
      })
    })

    it('should return validation errors if input is invalid', async () => {
      const mockFormData = new FormData()
      mockFormData.append('author', 'Jo')
      mockFormData.append('content', '')

      const result = await addPostAction(mockFormData)

      expect(result).toEqual({
        success: false,
        message: 'Validation failed',
        errors: {
          author: ['Author is required'],
          content: ['Content is required'],
        },
      })
    })

    it('should handle errors', async () => {
      const mockFormData = new FormData()
      mockFormData.append('author', 'John')
      mockFormData.append('content', 'Hello')

      vi.mocked(db.addPost).mockRejectedValue(new Error('Database error'))

      const result = await addPostAction(mockFormData)

      expect(result).toEqual({
        success: false,
        message: 'An error occurred while adding the post',
        error: 'Failed to add post',
      })
    })
  })
})
