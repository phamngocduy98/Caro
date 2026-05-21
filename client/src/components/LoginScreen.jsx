import { useState } from 'react'

function LoginScreen({ onLogin }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim().length < 2) return
    onLogin(name.trim())
  }

  return (
    <div className="login-screen">
      <h1>Tic Tac Toe</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
        />
        <button type="submit" disabled={name.trim().length < 2}>
          Play
        </button>
      </form>
    </div>
  )
}

export default LoginScreen