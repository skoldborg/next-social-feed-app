import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/utils/test-utils'
import { screen } from '@testing-library/react'
import { PostList } from '@/components/PostList'
import * as actions from '@/app/actions'
import * as hooks from '@/lib/hooks'
import { mockPosts } from '@/__mocks__/post'

// Mock the server action
vi.mock('@/app/actions', async () => {
  const actual = await vi.importActual<typeof import('@/app/actions')>(
    '@/app/actions'
  )
  return {
    ...actual,
    getPostsAction: vi.fn(),
  }
})

// Mock the Redux hooks
vi.mock('@/lib/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

// Mock useInView hook
vi.mock('react-intersection-observer', () => ({
  useInView: vi.fn(() => ({
    ref: vi.fn(),
    inView: false,
  })),
}))

describe('<PostList />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set a default mock implementation to avoid unhandled rejections
    ;(actions.getPostsAction as ReturnType<typeof vi.fn>).mockResolvedValue([])

    // Reset the mock for useAppSelector
    vi.mocked(hooks.useAppSelector).mockImplementation((selector) =>
      selector({
        posts: {
          posts: [],
          loading: false,
          error: null,
        },
      })
    )

    // Set default for useAppDispatch
    vi.mocked(hooks.useAppDispatch).mockReturnValue(
      vi.fn().mockResolvedValue({
        payload: mockPosts,
      })
    )
  })

  it('renders the loading skeleton when loading', async () => {
    // Mock the selector to return loading state
    vi.mocked(hooks.useAppSelector).mockImplementation((selector) =>
      selector({
        posts: {
          posts: [],
          loading: true,
          error: null,
        },
      })
    )

    renderWithProviders(<PostList />)

    expect(screen.getByTestId('post-list-skeleton')).toBeInTheDocument()
  })

  it('renders the list of posts', async () => {
    // Mock the selector to return posts
    vi.mocked(hooks.useAppSelector).mockImplementation((selector) =>
      selector({
        posts: {
          posts: mockPosts,
          loading: false,
          error: null,
        },
      })
    )

    renderWithProviders(<PostList />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders an error message when there is an error', async () => {
    // Mock the selector to return error state
    vi.mocked(hooks.useAppSelector).mockImplementation((selector) =>
      selector({
        posts: {
          posts: [],
          loading: false,
          error: 'Failed to fetch posts',
        },
      })
    )

    renderWithProviders(<PostList />)

    expect(screen.getByText(/Something went wrong!/i)).toBeInTheDocument()
  })

  it('dispatches fetchPosts on mount', async () => {
    const mockDispatch = vi.fn().mockResolvedValue({
      payload: mockPosts,
    })
    vi.mocked(hooks.useAppDispatch).mockReturnValue(mockDispatch)

    renderWithProviders(<PostList />)

    expect(mockDispatch).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
  })
})
