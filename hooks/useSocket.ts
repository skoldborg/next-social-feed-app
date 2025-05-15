import { Post } from '@/lib/types'
import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [newPost, setNewPost] = useState<Post>()

  useEffect(() => {
    const socketIo = io()

    socketIo.on('connect', () => {
      setIsConnected(true)
    })

    socketIo.on('disconnect', () => {
      setIsConnected(false)
    })

    socketIo.on('new post', (newPost: Post) => {
      console.log('received new post:', newPost)
      setNewPost(newPost)
    })

    setSocket(socketIo)

    return () => {
      socketIo.disconnect()
    }
  }, [])

  const emitPost = (newPost: Post) => {
    if (socket) {
      socket.emit('new post', newPost)
    }
  }

  return { isConnected, newPost, emitPost }
}
