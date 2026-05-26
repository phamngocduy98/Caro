import { useState } from 'react'
import LoginScreen from './components/LoginScreen.jsx'
import Lobby from './components/Lobby.jsx'
import Room from './components/Room.jsx'

function App() {
  const [username, setUsername] = useState('')
  const [screen, setScreen] = useState('login')
  const [roomConfig, setRoomConfig] = useState(null)

  const handleLogin = (name) => {
    setUsername(name)
    setScreen('lobby')
  }

  const handleEnterRoom = (config) => {
    setRoomConfig(config)
    setScreen('room')
  }

  return (
    <div className="app">
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
      {screen === 'lobby' && <Lobby username={username} onEnterRoom={handleEnterRoom} />}
      {screen === 'room' && (
        <Room
          username={username}
          mode={roomConfig?.mode}
          gameType={roomConfig?.gameType}
          intent={roomConfig?.intent}
          roomCode={roomConfig?.roomCode}
          onLeave={() => setScreen('lobby')}
        />
      )}
    </div>
  )
}

export default App