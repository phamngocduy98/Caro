import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io('http://localhost:3001')
    socketRef.current = socket
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    return () => socket.disconnect()
  }, [])

  return socketRef
}