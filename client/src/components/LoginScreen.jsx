import { useState, useEffect } from 'react'

function LoginScreen({ onLogin }) {
  const [name, setName] = useState('')
  const [isVisible, setIsVisible] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim().length < 2) return
    setIsVisible(false)
    setTimeout(() => onLogin(name.trim()), 400)
  }

  return (
    <div className={`login-screen ${!isVisible ? 'fade-out' : ''}`}>
      <div className="login-bg">
        <div className="grid-overlay"></div>
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
      </div>

      <div className="login-content">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 100 100" className="logo-svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff"/>
                  <stop offset="100%" stopColor="#ff006e"/>
                </linearGradient>
              </defs>
              <line x1="10" y1="10" x2="40" y2="40" stroke="url(#logoGrad)" strokeWidth="8" strokeLinecap="round"/>
              <line x1="40" y1="10" x2="10" y2="40" stroke="url(#logoGrad)" strokeWidth="8" strokeLinecap="round"/>
              <circle cx="70" cy="25" r="18" fill="none" stroke="url(#logoGrad)" strokeWidth="8"/>
            </svg>
          </div>
          <h1 className="logo-title">
            <span className="title-x">X</span>
            <span className="title-divider">vs</span>
            <span className="title-o">O</span>
          </h1>
          <p className="logo-subtitle">TIC TAC TOE</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="name-input"
              autoFocus
            />
            <div className="input-glow"></div>
          </div>
          <button type="submit" disabled={name.trim().length < 2} className="play-btn">
            <span className="btn-text">PLAY</span>
            <span className="btn-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </span>
          </button>
        </form>

        <div className="login-footer">
          <div className="feature-badges">
            <span className="badge">Online Multiplayer</span>
            <span className="badge">Classic Mode</span>
            <span className="badge">AI Opponent</span>
          </div>
        </div>
      </div>

      <style>{`
        .login-screen {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #050508;
          padding: 2rem;
        }

        .login-screen.fade-out {
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.4s ease;
        }

        .login-bg {
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
          background-size: 60px 60px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
        }

        .glow-orb-1 {
          width: 50vmax;
          height: 50vmax;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
          top: -20vmax;
          left: -20vmax;
          animation: float 8s ease-in-out infinite;
        }

        .glow-orb-2 {
          width: 40vmax;
          height: 40vmax;
          background: radial-gradient(circle, rgba(255, 0, 110, 0.25) 0%, transparent 70%);
          bottom: -15vmax;
          right: -15vmax;
          animation: float 10s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(3vmin, -3vmin); }
        }

        .login-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3vmin;
          width: 100%;
          max-width: 500px;
        }

        .logo-container {
          text-align: center;
          animation: slideUp 0.8s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(3vmin); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logo-icon {
          width: 10vmin;
          height: 10vmin;
          max-width: 100px;
          max-height: 100px;
          margin: 0 auto 2vmin;
          animation: pulse-glow 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 2vmin rgba(0, 212, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 4vmin rgba(255, 0, 110, 0.6)); }
        }

        .logo-svg {
          width: 100%;
          height: 100%;
        }

        .logo-title {
          font-size: 8vmin;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2vmin;
          margin: 0;
          line-height: 1;
        }

        .title-x {
          color: #00d4ff;
          text-shadow: 0 0 3vmin #00d4ff, 0 0 6vmin #00d4ff;
          animation: glowX 2s ease-in-out infinite alternate;
        }

        @keyframes glowX {
          from { text-shadow: 0 0 3vmin #00d4ff, 0 0 6vmin #00d4ff; }
          to { text-shadow: 0 0 4vmin #00d4ff, 0 0 8vmin #00d4ff, 0 0 12vmin #00d4ff; }
        }

        .title-divider {
          color: #8b5cf6;
          font-size: 3vmin;
          font-weight: 300;
          opacity: 0.6;
        }

        .title-o {
          color: #ff006e;
          text-shadow: 0 0 3vmin #ff006e, 0 0 6vmin #ff006e;
          animation: glowO 2s ease-in-out infinite alternate;
        }

        @keyframes glowO {
          from { text-shadow: 0 0 3vmin #ff006e, 0 0 6vmin #ff006e; }
          to { text-shadow: 0 0 4vmin #ff006e, 0 0 8vmin #ff006e, 0 0 12vmin #ff006e; }
        }

        .logo-subtitle {
          font-size: 1.5vmin;
          letter-spacing: 1.2vmin;
          color: #666680;
          margin-top: 1.5vmin;
          font-weight: 600;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2vmin;
          animation: slideUp 0.8s ease-out 0.2s both;
          width: 100%;
        }

        .input-wrapper {
          position: relative;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
        }

        .name-input {
          width: 100%;
          max-width: 320px;
          padding: 2vmin 3vmin;
          font-size: 2vmin;
          font-weight: 500;
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 2vmin;
          outline: none;
          text-align: center;
          transition: all 0.3s ease;
        }

        .name-input::placeholder {
          color: #4a4a5a;
        }

        .name-input:focus {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
          box-shadow: 0 0 4vmin rgba(139, 92, 246, 0.2);
        }

        .input-glow {
          position: absolute;
          inset: -2px;
          border-radius: 2vmin;
          background: linear-gradient(135deg, #00d4ff, #8b5cf6, #ff006e);
          opacity: 0;
          z-index: -1;
          transition: opacity 0.3s ease;
          filter: blur(1vmin);
        }

        .name-input:focus ~ .input-glow {
          opacity: 0.3;
        }

        .play-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5vmin;
          padding: 2vmin 5vmin;
          font-size: 2vmin;
          font-weight: 700;
          letter-spacing: 0.5vmin;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          border-radius: 2vmin;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .play-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .play-btn:hover:not(:disabled) {
          transform: translateY(-0.5vmin);
          box-shadow: 0 1vmin 4vmin rgba(139, 92, 246, 0.4);
        }

        .play-btn:hover:not(:disabled)::before {
          opacity: 1;
        }

        .play-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-icon {
          width: 2.5vmin;
          height: 2.5vmin;
        }

        .btn-icon svg {
          width: 100%;
          height: 100%;
        }

        .login-footer {
          animation: slideUp 0.8s ease-out 0.4s both;
        }

        .feature-badges {
          display: flex;
          gap: 1.5vmin;
          flex-wrap: wrap;
          justify-content: center;
        }

        .badge {
          padding: 1vmin 2vmin;
          font-size: 1.3vmin;
          font-weight: 500;
          color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 3vmin;
        }

        @media (max-width: 480px) {
          .logo-title {
            font-size: 12vmin;
            gap: 3vmin;
          }
          .title-divider {
            font-size: 5vmin;
          }
          .name-input {
            max-width: 80vw;
          }
          .logo-subtitle {
            letter-spacing: 2vmin;
          }
        }
      `}</style>
    </div>
  )
}

export default LoginScreen