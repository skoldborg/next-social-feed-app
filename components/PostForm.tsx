'use client'

import { ActionResponse } from '@/app/actions'
import { addPost } from '@/lib/features/posts/postsSlice'
import { useAppDispatch } from '@/lib/hooks'
import Form from 'next/form'
import { useActionState } from 'react'
import cx from 'classnames'

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
}

export const PostForm = () => {
  const dispatch = useAppDispatch()

  // Use useActionState hook for the form submission action
  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    try {
      await dispatch(addPost(formData))

      return {
        success: true,
        message: '',
        error: undefined,
      }
    } catch (err) {
      return {
        success: false,
        message: (err as Error).message || 'An error occurred',
        errors: undefined,
      }
    }
  }, initialState)

  const inputClasses =
    'flex h-10 w-full  bg-white text-zinc-800 text-sm disabled:cursor-not-allowed disabled:opacity-50'
  const textareaClasses =
    'flex min-h-[80px] w-full bg-white text-zinc-800 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <Form
      action={formAction}
      className="p-2 max-w-xs"
      formEncType="multipart/form-data"
    >
      <div className="mb-4">
        <label htmlFor="author" className="block text-sm font-bold mb-2">
          Your name
        </label>
        <input
          id="author"
          type="text"
          name="author"
          className={cx(inputClasses, 'px-3 py-2')}
          disabled={isPending}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-bold mb-2">
          Message
        </label>
        <textarea
          id="content"
          name="content"
          className={textareaClasses}
          rows={4}
          disabled={isPending}
          required
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="avatar" className="block text-sm font-bold mb-2">
          Upload an avatar image
        </label>
        <input
          id="avatar"
          type="file"
          name="avatar"
          accept="image/*"
          disabled={isPending}
          className={cx(
            inputClasses,
            'file:h-full file:px-4 file:border-0 file:bg-gray-300 file:text-zinc-800 file:mr-2'
          )}
        />
      </div>
      <div className="flex gap-2">
        <button
          disabled={isPending}
          type="submit"
          className="bg-gray-300 text-zinc-800 px-4 py-2"
        >
          Submit
        </button>

        {!state.success && state.message && (
          <div className="flex items-center">
            <p className="text-sm text-wrap text-red-500">{state.message}</p>
          </div>
        )}
      </div>
    </Form>
  )
}
