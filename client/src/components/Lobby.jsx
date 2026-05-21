import { useState } from 'react'

const GAME_TYPES = ['classic', 'ultimate', '3d', 'wild', 'misere', 'tictactwo', 'infinite']
const PLAY_MODES = ['local', 'bot', 'online']

function Lobby({ username, onEnterRoom }) {
  const [mode, setMode] = useState('local')
  const [gameType, setGameType] = useState('classic')

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
      <button onClick={() => onEnterRoom({ mode, gameType })}>Start Game</button>
    </div>
  )
}

export default Lobby