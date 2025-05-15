'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { Post } from '@/lib/types'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { addNewPost } from '@/lib/features/posts/postsSlice'

type SocketContextType = {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const dispatch = useAppDispatch()
  const posts = useAppSelector((state) => state.posts.posts)

  useEffect(() => {
    const socketIo = io()

    socketIo.on('connect', () => {
      setIsConnected(true)
    })

    socketIo.on('disconnect', () => {
      setIsConnected(false)
    })

    socketIo.on('new post', (newPost: Post) => {
      const postExists = posts.some((post) => post.id === newPost.id)

      if (!postExists) {
        // Show a toast notification for all clients except the one that posted
        toast(`${newPost.author} added a new post!`)

        // Add new post to the store
        dispatch(addNewPost(newPost))
      }
    })

    setSocket(socketIo)

    return () => {
      socketIo.disconnect()
    }
  }, [posts, dispatch])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}
