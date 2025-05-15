import { addPostAction, getPostsAction } from '@/app/actions'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { socket } from '@/lib/socket'
import { Post } from '@/lib/types'

export type PostsState = {
  posts: Post[]
  loading: boolean
  error: string | null
}

// Initial state
const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
}

// Async thunk for fetching posts
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const posts = await getPostsAction()
  return posts
})

// Async thunk for adding a post
export const addPost = createAsyncThunk(
  'posts/addPost',
  async (formData: FormData) => {
    const response = await addPostAction(formData)

    if (!response.success || !response.post) {
      throw new Error(response.message)
    }
    return response.post
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchPosts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.loading = false
        state.posts = action.payload
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch posts'
      })
      // Handle addPost
      .addCase(addPost.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.loading = false
        state.posts.unshift(action.payload) // Add the new post to the top

        // Emit event to notify that a new post has been added
        socket.emit('new post', action.payload)
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to add post'
      })
  },
})

export default postsSlice.reducer
