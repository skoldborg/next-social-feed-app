import { mockPosts } from '@/__mocks__/post'
import { getSinglePostAction } from '@/app/actions'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SinglePost from '../page'

vi.mock('@/app/actions', () => ({
  getSinglePostAction: vi.fn(),
}))

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  ),
}))

describe('Singe Post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('it renders a single post', async () => {
    const mockPost = mockPosts[0]

    vi.mocked(getSinglePostAction).mockResolvedValue(mockPost)

    render(await SinglePost({ params: Promise.resolve({ id: '1234' }) }))

    expect(screen.getByText(mockPost.author)).toBeInTheDocument()
    expect(screen.getByText(mockPost.content)).toBeInTheDocument()
  })
})
