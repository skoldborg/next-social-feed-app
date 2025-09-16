import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PostForm } from '../PostForm'
import { useAddPost } from '@/lib/hooks'

vi.mock('@/lib/hooks', () => ({
  useAddPost: vi.fn(),
}))

const mockUseAddPost = vi.mocked(useAddPost)

describe('<PostForm />', () => {
  const mutateAsync = vi.fn()
  const reset = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseAddPost.mockReturnValue({
      mutateAsync,
      isPending: false,
      reset,
    } as unknown as ReturnType<typeof useAddPost>)
  })

  it('renders the form correctly', () => {
    render(<PostForm />)

    expect(screen.getByLabelText(/Your name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Upload an avatar image/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument()
  })

  it('submits the form and calls mutateAsync with correct FormData', async () => {
    const user = userEvent.setup()

    mutateAsync.mockResolvedValue({
      success: true,
      message: 'Post added successfully',
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
      expect(mutateAsync).toHaveBeenCalledWith(expect.any(FormData))
    })

    // Verify the FormData contains correct values
    const formData = mutateAsync.mock.calls[0][0]
    expect(formData.get('author')).toBe('John Doe')
    expect(formData.get('content')).toBe('Hello, world!')
    expect(formData.get('avatar')).toEqual(file)
  })

  it('resets the form after successful submission', async () => {
    const user = userEvent.setup()

    mutateAsync.mockResolvedValue({
      success: true,
      message: 'Post added successfully',
    })

    render(<PostForm />)

    await user.type(screen.getByLabelText(/Your name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Message/i), 'Hello, world!')
    await user.click(screen.getByRole('button', { name: /Submit/i }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled())

    // Inputs should be cleared after success
    expect(screen.getByLabelText(/Your name/i)).toHaveValue('')
    expect(screen.getByLabelText(/Message/i)).toHaveValue('')
  })

  it('does not submit the form when required fields are empty', async () => {
    const user = userEvent.setup()
    render(<PostForm />)

    await user.click(screen.getByRole('button', { name: /Submit/i }))

    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('shows an error message when submission fails', async () => {
    const user = userEvent.setup()

    // Mock the mutation to return an error response
    mutateAsync.mockResolvedValue({
      success: false,
      message: 'An error occurred while adding the post',
      error: 'Failed to add post',
    })

    render(<PostForm />)

    await user.type(screen.getByLabelText(/Your name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Message/i), 'Dummy content')
    await user.click(screen.getByRole('button', { name: /Submit/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/An error occurred while adding the post/i)
      ).toBeInTheDocument()
    })
  })
})
