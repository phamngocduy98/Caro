import { useState } from 'react'
import { useSocket } from '../hooks/useSocket.js'

const GAME_TYPES = [
  { id: 'classic', name: 'Classic', desc: 'Standard 3x3', icon: '◇' }
]

const PLAY_MODES = [
  { id: 'local', name: 'Local', desc: '2 players, 1 device', icon: '⌘', color: '#10b981' },
  { id: 'bot', name: 'vs AI', desc: 'Challenge the computer', icon: '◧', color: '#f59e0b' },
  { id: 'online', name: 'Online', desc: 'Play with others', icon: '◈', color: '#8b5cf6' }
]

function Lobby({ username, onEnterRoom }) {
  const socketRef = useSocket()
  const [mode, setMode] = useState('online')
  const [gameType, setGameType] = useState('classic')
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [isMatching, setIsMatching] = useState(false)
  const [showJoinInput, setShowJoinInput] = useState(false)

  const handleAutoMatch = () => {
    setIsMatching(true)
    onEnterRoom({ mode: 'online', gameType, intent: 'auto-match' })
  }

  const handleJoinRoom = () => {
    if (roomCodeInput.length !== 4) return
    onEnterRoom({ mode: 'online', gameType, intent: 'join', roomCode: roomCodeInput })
  }

  const handleCreateRoom = () => {
    onEnterRoom({ mode: 'online', gameType, intent: 'create' })
  }

  const selectedMode = PLAY_MODES.find(m => m.id === mode)

  return (
    <div className="lobby">
      <div className="lobby-bg">
        <div className="grid-overlay"></div>
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
      </div>

      <div className="lobby-content">
        <header className="lobby-header">
          <div className="back-btn" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </div>
          <div className="player-info">
            <div className="player-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="player-name">{username}</span>
          </div>
        </header>

        <div className="game-title">
          <h1>TIC TAC TOE</h1>
          <p>Select your game mode</p>
        </div>

        <div className="mode-section">
          <h2 className="section-title">
            <span className="section-num">01</span>
            PLAY MODE
          </h2>
          <div className="mode-grid">
            {PLAY_MODES.map(m => (
              <button
                key={m.id}
                className={`mode-card ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
                style={{ '--accent': m.color }}
              >
                <span className="mode-icon">{m.icon}</span>
                <span className="mode-name">{m.name}</span>
                <span className="mode-desc">{m.desc}</span>
                {mode === m.id && <div className="mode-glow"></div>}
              </button>
            ))}
          </div>
        </div>

        <div className="game-type-section">
          <h2 className="section-title">
            <span className="section-num">02</span>
            GAME TYPE
          </h2>
          <div className="game-type-grid">
            {GAME_TYPES.map(g => (
              <button
                key={g.id}
                className={`type-card ${gameType === g.id ? 'active' : ''}`}
                onClick={() => setGameType(g.id)}
              >
                <span className="type-icon">{g.icon}</span>
                <span className="type-name">{g.name}</span>
                <span className="type-desc">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="action-section">
          {mode === 'online' && (
            <div className="online-actions">
              <button className="action-btn primary" onClick={handleCreateRoom}>
                <span className="btn-icon">+</span>
                <span className="btn-text">Create Room</span>
              </button>

              {showJoinInput ? (
                <div className="join-input-group">
                  <input
                    type="text"
                    placeholder="CODE"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    maxLength={4}
                    autoFocus
                  />
                  <button
                    className="join-btn"
                    onClick={handleJoinRoom}
                    disabled={roomCodeInput.length !== 4}
                  >
                    JOIN
                  </button>
                  <button className="cancel-btn" onClick={() => setShowJoinInput(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <button className="action-btn secondary" onClick={() => setShowJoinInput(true)}>
                  <span className="btn-icon">⌥</span>
                  <span className="btn-text">Join Room</span>
                </button>
              )}

              <button
                className={`action-btn match ${isMatching ? 'matching' : ''}`}
                onClick={handleAutoMatch}
                disabled={isMatching}
              >
                {isMatching ? (
                  <>
                    <span className="matching-dots">
                      <span></span><span></span><span></span>
                    </span>
                    <span className="btn-text">Finding Match...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon">⚡</span>
                    <span className="btn-text">Auto Match</span>
                  </>
                )}
              </button>
            </div>
          )}

          {mode !== 'online' && (
            <button className="start-btn" onClick={() => onEnterRoom({ mode, gameType, intent: 'local' })}>
              <span className="btn-text">START GAME</span>
              <span className="btn-arrow">→</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .lobby {
          min-height: 100vh;
          min-height: 100dvh;
          position: relative;
          overflow: hidden;
          background: #050508;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lobby-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
          background-size: 8vmin 8vmin;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(15vmin);
          opacity: 0.3;
        }

        .glow-orb-1 {
          width: 80vmin;
          height: 80vmin;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
          top: -30vmin;
          right: -20vmin;
        }

        .glow-orb-2 {
          width: 60vmin;
          height: 60vmin;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%);
          bottom: -20vmin;
          left: -20vmin;
        }

        .lobby-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 90vmin;
          max-height: 100dvh;
          padding: 3vmin 2vmin;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .lobby-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4vmin;
        }

        .back-btn {
          width: 6vmin;
          height: 6vmin;
          max-width: 60px;
          max-height: 60px;
          min-width: 40px;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2vmin;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }

        .back-btn svg {
          width: 40%;
          height: 40%;
          color: #8b8b9a;
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 2vmin;
        }

        .player-avatar {
          width: 6vmin;
          height: 6vmin;
          max-width: 50px;
          max-height: 50px;
          min-width: 36px;
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border-radius: 2vmin;
          font-weight: 700;
          font-size: 2.5vmin;
        }

        .player-name {
          font-weight: 600;
          color: #fff;
          font-size: 2vmin;
        }

        .game-title {
          text-align: center;
          margin-bottom: 5vmin;
        }

        .game-title h1 {
          font-size: 2vmin;
          letter-spacing: 1vmin;
          color: #666680;
          font-weight: 600;
          margin-bottom: 1.5vmin;
        }

        .game-title p {
          font-size: 1.5vmin;
          color: #4a4a5a;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 2vmin;
          font-size: 1.3vmin;
          letter-spacing: 0.4vmin;
          color: #4a4a5a;
          font-weight: 600;
          margin-bottom: 2.5vmin;
        }

        .section-num {
          font-size: 1.2vmin;
          color: #8b5cf6;
          padding: 0.8vmin 1.5vmin;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 1vmin;
        }

        .mode-section {
          margin-bottom: 5vmin;
        }

        .mode-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2vmin;
        }

        .mode-card {
          position: relative;
          padding: 3vmin 2vmin;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 2vmin;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          overflow: hidden;
        }

        .mode-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-0.5vmin);
        }

        .mode-card.active {
          border-color: var(--accent);
          background: rgba(139, 92, 246, 0.08);
        }

        .mode-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, var(--accent), transparent 70%);
          opacity: 0.1;
          pointer-events: none;
        }

        .mode-icon {
          font-size: 4vmin;
          display: block;
          margin-bottom: 1.5vmin;
          filter: grayscale(0.5);
          transition: all 0.3s ease;
        }

        .mode-card.active .mode-icon {
          filter: none;
        }

        .mode-name {
          display: block;
          font-size: 2.5vmin;
          font-weight: 700;
          color: #fff;
          margin-bottom: 1vmin;
        }

        .mode-desc {
          display: block;
          font-size: 1.4vmin;
          color: #6a6a7a;
        }

        .mode-card.active .mode-name {
          color: var(--accent);
        }

        .game-type-section {
          margin-bottom: 5vmin;
        }

        .game-type-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5vmin;
        }

        .type-card {
          position: relative;
          padding: 2vmin 1.5vmin;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 1.5vmin;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .type-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }

        .type-card.active {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
        }

        .type-icon {
          font-size: 3vmin;
          display: block;
          margin-bottom: 1vmin;
        }

        .type-card.active .type-icon {
          color: #8b5cf6;
        }

        .type-name {
          display: block;
          font-size: 1.6vmin;
          font-weight: 600;
          color: #aaa;
          margin-bottom: 0.5vmin;
        }

        .type-card.active .type-name {
          color: #fff;
        }

        .type-desc {
          display: block;
          font-size: 1.2vmin;
          color: #555;
        }

        .action-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2vmin;
        }

        .online-actions {
          display: flex;
          gap: 2vmin;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          max-width: 70vmin;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5vmin;
          padding: 2vmin 3vmin;
          font-size: 1.8vmin;
          font-weight: 600;
          border-radius: 1.5vmin;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          min-width: 18vmin;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: #fff;
          box-shadow: 0 0.5vmin 3vmin rgba(139, 92, 246, 0.3);
        }

        .action-btn.primary:hover {
          transform: translateY(-0.5vmin);
          box-shadow: 0 1vmin 4vmin rgba(139, 92, 246, 0.4);
        }

        .action-btn.secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #aaa;
        }

        .action-btn.secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          color: #fff;
        }

        .action-btn.match {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          box-shadow: 0 0.5vmin 3vmin rgba(16, 185, 129, 0.3);
        }

        .action-btn.match:hover:not(:disabled) {
          transform: translateY(-0.5vmin);
          box-shadow: 0 1vmin 4vmin rgba(16, 185, 129, 0.4);
        }

        .action-btn.match.matching {
          animation: pulse-btn 1.5s ease-in-out infinite;
        }

        @keyframes pulse-btn {
          0%, 100% { box-shadow: 0 0.5vmin 3vmin rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0.5vmin 5vmin rgba(16, 185, 129, 0.5); }
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 2vmin;
        }

        .matching-dots {
          display: flex;
          gap: 0.5vmin;
        }

        .matching-dots span {
          width: 0.8vmin;
          height: 0.8vmin;
          background: white;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .matching-dots span:nth-child(1) { animation-delay: 0s; }
        .matching-dots span:nth-child(2) { animation-delay: 0.2s; }
        .matching-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .join-input-group {
          display: flex;
          align-items: center;
          gap: 1vmin;
          background: rgba(255,255,255,0.05);
          padding: 1vmin 1.5vmin;
          border-radius: 1.5vmin;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .join-input-group input {
          width: 12vmin;
          padding: 1vmin;
          font-size: 2vmin;
          font-weight: 700;
          letter-spacing: 0.5vmin;
          text-align: center;
          background: transparent;
          border: none;
          color: #fff;
          outline: none;
          text-transform: uppercase;
        }

        .join-input-group input::placeholder {
          letter-spacing: 0;
          font-weight: 400;
          color: #555;
        }

        .join-btn {
          padding: 1vmin 2vmin;
          font-size: 1.5vmin;
          font-weight: 700;
          background: #8b5cf6;
          color: #fff;
          border: none;
          border-radius: 1vmin;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .join-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .cancel-btn {
          width: 4vmin;
          height: 4vmin;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #666;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          color: #fff;
        }

        .cancel-btn svg {
          width: 50%;
          height: 50%;
        }

        .start-btn {
          display: flex;
          align-items: center;
          gap: 2vmin;
          padding: 2.5vmin 7vmin;
          font-size: 2vmin;
          font-weight: 700;
          letter-spacing: 0.5vmin;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          border: none;
          border-radius: 2vmin;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0.5vmin 4vmin rgba(16, 185, 129, 0.4);
        }

        .start-btn:hover {
          transform: translateY(-0.5vmin);
          box-shadow: 0 1vmin 5vmin rgba(16, 185, 129, 0.5);
        }

        .btn-arrow {
          font-size: 2.5vmin;
          transition: transform 0.3s ease;
        }

        .start-btn:hover .btn-arrow {
          transform: translateX(0.5vmin);
        }

        @media (max-width: 600px) {
          .mode-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5vmin;
          }

          .mode-card {
            padding: 2.5vmin 1.5vmin;
          }

          .mode-icon {
            font-size: 4vmin;
          }

          .mode-name {
            font-size: 2.5vmin;
          }

          .game-type-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1vmin;
          }

          .type-card {
            padding: 2vmin 1vmin;
          }

          .online-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .action-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .game-type-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  )
}

export default Lobby