import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Use current host for socket connection (works for both local and network access)
    const socketUrl = window.location.hostname + ':3001'
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    return () => socket.disconnect()
  }, [])

  return socketRef
}