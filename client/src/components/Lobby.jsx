import { useState } from 'react'
import { useSocket } from '../hooks/useSocket.js'

const GAME_TYPES = ['classic', 'ultimate', '3d', 'wild', 'misere', 'tictactwo', 'infinite']
const PLAY_MODES = ['local', 'bot', 'online']

function Lobby({ username, onEnterRoom }) {
  const socketRef = useSocket()
  const [mode, setMode] = useState('online')
  const [gameType, setGameType] = useState('classic')
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [isMatching, setIsMatching] = useState(false)

  const handleAutoMatch = () => {
    setIsMatching(true)
    onEnterRoom({ mode: 'online', gameType, action: 'auto-match' })
  }

  const handleJoinRoom = () => {
    if (roomCodeInput.length !== 4) return
    onEnterRoom({ mode: 'online', gameType, action: 'join', roomCode: roomCodeInput })
  }

  const handleCreateRoom = () => {
    onEnterRoom({ mode: 'online', gameType, action: 'create' })
  }

  return (
    <div className="lobby">
      <p>Welcome, {username}</p>
      <div className="mode-selector">
        {PLAY_MODES.map(m => (
          <button key={m} onClick={() => setMode(m)} className={mode === m ? 'active' : ''}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
      <div className="game-type-selector">
        {GAME_TYPES.map(g => (
          <button key={g} onClick={() => setGameType(g)} className={gameType === g ? 'active' : ''}>
            {g}
          </button>
        ))}
      </div>
      {mode === 'online' && (
        <div className="online-options">
          <button onClick={handleCreateRoom}>Create Room</button>
          <div className="join-room">
            <input
              placeholder="Room code"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              maxLength={4}
            />
            <button onClick={handleJoinRoom} disabled={roomCodeInput.length !== 4}>
              Join
            </button>
          </div>
          <button onClick={handleAutoMatch} disabled={isMatching} className="auto-match-btn">
            {isMatching ? 'Matching...' : 'Auto Match'}
          </button>
        </div>
      )}
      {mode !== 'online' && (
        <button onClick={() => onEnterRoom({ mode, gameType, action: 'local' })}>Start Game</button>
      )}
    </div>
  )
}

export default Lobby