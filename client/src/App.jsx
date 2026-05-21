import { useState } from 'react'

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
