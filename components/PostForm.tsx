'use client'

import cx from 'classnames'
import Form from 'next/form'
import { useRef, useState } from 'react'
import { useAddPost } from '@/lib/hooks'
import { socket } from '@/lib/socket'

export const PostForm = () => {
  const { mutateAsync, isPending, reset } = useAddPost()
  const [error, setError] = useState<string>('')
  const formRef = useRef<HTMLFormElement | null>(null)

  async function onSubmit(formData: FormData) {
    setError('')
    const result = await mutateAsync(formData)

    if (!result.success) {
      setError(result.message || 'An error occurred')
      return
    }

    // Broadcast the new post to other clients
    if (result.post) {
      socket.emit('new post', result.post)
    }

    // Clear the form after successful submit
    if (formRef.current) {
      formRef.current.reset()
    }
    reset()
  }

  const inputClasses =
    'flex h-10 w-full  bg-white text-zinc-800 text-sm disabled:cursor-not-allowed disabled:opacity-50'
  const textareaClasses =
    'flex min-h-[80px] w-full bg-white text-zinc-800 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <Form
      ref={formRef}
      action={onSubmit}
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

        {error && (
          <div className="flex items-center">
            <p aria-live="polite" className="text-sm text-wrap text-red-500">
              {error}
            </p>
          </div>
        )}
      </div>
    </Form>
  )
}
