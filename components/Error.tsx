'use client'

import { useEffect } from 'react'

export const Error = ({ error }: { error: string }) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-6 max-w-md">
        We encountered an error while loading this page. Please try reloading
        your browser or contact support if the problem persists.
      </p>
    </div>
  )
}
