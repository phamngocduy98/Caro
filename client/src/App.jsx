import { useState } from 'react'
import LoginScreen from './components/LoginScreen.jsx'
import Lobby from './components/Lobby.jsx'

// Placeholder - Room will be created in Task 5
function Room() { return null }

function App() {
  const [username, setUsername] = useState('')
  const [screen, setScreen] = useState('login') // login | lobby | room

  const handleLogin = (name) => {
    setUsername(name)
    setScreen('lobby')
  }

  return (
    <div className="app">
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
      {screen === 'lobby' && <Lobby username={username} onEnterRoom={() => setScreen('room')} />}
      {screen === 'room' && <Room username={username} onLeave={() => setScreen('lobby')} />}
    </div>
  )
}

export default App
