import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PostForm } from '../PostForm'
import * as hooks from '@/lib/hooks'
import * as actions from '@/app/actions'
import * as postsSlice from '@/lib/features/posts/postsSlice'
import { mockPosts } from '@/__mocks__/post'

// Mock the server action
vi.mock('@/app/actions', async () => {
  const actual = await vi.importActual<typeof import('@/app/actions')>(
    '@/app/actions'
  )
  return {
    ...actual,
    addPostAction: vi.fn(),
  }
})

vi.mock('@/lib/hooks', () => ({
  useAppDispatch: vi.fn(),
}))

vi.mock('@/lib/features/posts/postsSlice', () => ({
  addPost: vi.fn((formData) => ({
    type: 'posts/addPost/fulfilled',
    payload: formData,
  })),
}))

describe('<PostForm />', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Set a default mock implementation to avoid unhandled rejections
    ;(actions.addPostAction as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      message: 'Post added successfully',
      post: mockPosts[0],
    })

    vi.mocked(hooks.useAppDispatch).mockReturnValue(mockDispatch)
  })

  it('renders the form correctly', () => {
    render(<PostForm />)

    expect(screen.getByLabelText(/Your name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Upload an avatar image/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument()
  })

  it('submits the form and dispatches addPost', async () => {
    const mockPost = { id: '1', author: 'John Doe', content: 'Hello, world!' }
    mockDispatch.mockResolvedValue({
      type: 'posts/addPost/fulfilled',
      payload: mockPost,
    }) // Mock addPost thunk

    render(<PostForm />)

    // Fill out form
    fireEvent.change(screen.getByLabelText(/Your name/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: 'Hello, world!' },
    })

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/Upload an avatar image/i), {
      target: { files: [file] },
    })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }))

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(1)

      // Verify that addPost was called with a FormData object
      const dispatchedAction = mockDispatch.mock.calls[0][0]

      // Simulate the thunk execution to verify the FormData
      const formData = new FormData()
      formData.append('author', 'John Doe')
      formData.append('content', 'Hello, world!')
      formData.append('avatar', file)

      expect(dispatchedAction).toEqual(postsSlice.addPost(expect.any(FormData)))
    })
  })

  it('does not submit the form when required fields are empty', async () => {
    render(<PostForm />)

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }))

    await waitFor(() => {
      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  it('shows an error message when submission fails', async () => {
    mockDispatch.mockRejectedValue(new Error('Failed to submit post'))

    render(<PostForm />)

    fireEvent.change(screen.getByLabelText(/Your name/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: 'Dummy content' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Failed to submit post/i)).toBeInTheDocument()
    })
  })
})
