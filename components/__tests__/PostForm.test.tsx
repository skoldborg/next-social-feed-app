import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PostForm } from '../PostForm'

import { useQueryClient } from '@tanstack/react-query'
import { addPostAction } from '@/app/actions'

// Mock the server action
vi.mock('@/app/actions', () => ({
  addPostAction: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
}))

const mockAddPostAction = vi.mocked(addPostAction)
const mockUseQueryClient = vi.mocked(useQueryClient)

describe('<PostForm />', () => {
  const mockInvalidateQueries = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
      refetchQueries: vi.fn(),
    } as any)
  })

  it('renders the form correctly', () => {
    render(<PostForm />)

    expect(screen.getByLabelText(/Your name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Upload an avatar image/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument()
  })

  it('submits the form and calls addPostAction with correct data', async () => {
    const user = userEvent.setup()
    const mockPost = { id: '1', author: 'John Doe', content: 'Hello, world!' }

    mockAddPostAction.mockResolvedValue({
      success: true,
      message: 'Post added successfully',
      post: mockPost,
    })

    render(<PostForm />)

    // Fill out form
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    await user.type(screen.getByLabelText(/Your name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Message/i), 'Hello, world!')
    await user.upload(screen.getByLabelText(/Upload an avatar image/i), file)

    // Submit
    await user.click(screen.getByRole('button', { name: /Submit/i }))

    await waitFor(() => {
      expect(mockAddPostAction).toHaveBeenCalledWith(expect.any(FormData))
    })

    // Verify the FormData contains correct values
    const formData = mockAddPostAction.mock.calls[0][0]
    expect(formData.get('author')).toBe('John Doe')
    expect(formData.get('content')).toBe('Hello, world!')
    expect(formData.get('avatar')).toEqual(file)
  })

  it('invalidates queries after successful submission', async () => {
    const user = userEvent.setup()

    mockAddPostAction.mockResolvedValue({
      success: true,
      message: 'Post added successfully',
      post: { id: '1', author: 'John Doe', content: 'Hello, world!' },
    })

    render(<PostForm />)

    await user.type(screen.getByLabelText(/Your name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Message/i), 'Hello, world!')
    await user.click(screen.getByRole('button', { name: /Submit/i }))

    await waitFor(() => {
      expect(mockAddPostAction).toHaveBeenCalled()
    })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['posts'],
    })
  })

  it('does not submit the form when required fields are empty', async () => {
    const user = userEvent.setup()
    render(<PostForm />)

    await user.click(screen.getByRole('button', { name: /Submit/i }))

    expect(mockAddPostAction).not.toHaveBeenCalled()
  })

  it('shows an error message when submission fails', async () => {
    const user = userEvent.setup()

    // Mock the server action to return an error
    mockAddPostAction.mockResolvedValue({
      success: false,
      message: 'An error occurred while adding the post',
      error: 'Failed to add post',
    })

    render(<PostForm />)

    await user.type(screen.getByLabelText(/Your name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Message/i), 'Dummy content')
    await user.click(screen.getByRole('button', { name: /Submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Failed to add post/i)).toBeInTheDocument()
    })

    // Verify queries were NOT invalidated on failure
    expect(mockInvalidateQueries).not.toHaveBeenCalled()
  })
})
