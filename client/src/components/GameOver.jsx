function GameOver({ winner, onPlayAgain, onLeave }) {
  const isDraw = winner === 'draw'
  const isX = winner === 'X'
  const isO = winner === 'O'
  const isDisconnect = winner === 'opponent_left'

  let message = isDisconnect ? 'Opponent Left' : isDraw ? "It's a Draw!" : `${winner} Wins!`
  let winClass = isDisconnect ? 'disconnect' : isDraw ? 'draw' : isX ? 'x-wins' : 'o-wins'

  return (
    <div className="game-over">
      <div className="game-over-bg">
        <div className="result-glow"></div>
      </div>

      <div className="result-content">
        <div className="result-icon">
          {isDisconnect ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : isX ? (
            <svg viewBox="0 0 100 100">
              <line x1="15" y1="15" x2="50" y2="50" stroke="#00d4ff" strokeWidth="12" strokeLinecap="round"/>
              <line x1="50" y1="15" x2="15" y2="50" stroke="#00d4ff" strokeWidth="12" strokeLinecap="round"/>
            </svg>
          ) : isO ? (
            <svg viewBox="0 0 100 100">
              <circle cx="32" cy="32" r="22" fill="none" stroke="#ff006e" strokeWidth="12"/>
            </svg>
          ) : (
            <svg viewBox="0 0 100 100">
              <line x1="20" y1="50" x2="80" y2="50" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round"/>
            </svg>
          )}
        </div>

        <h2 className={`result-text ${winClass}`}>{message}</h2>

        <div className="result-actions">
          {onPlayAgain && (
            <button className="action-btn primary" onClick={onPlayAgain}>
              <span className="btn-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
              </span>
              Play Again
            </button>
          )}
          <button className="action-btn secondary" onClick={onLeave}>
            <span className="btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </span>
            Leave
          </button>
        </div>
      </div>

      <style>{`
        .game-over {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          padding: 5vmin 3vmin;
        }

        .game-over-bg {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .result-glow {
          width: 60vmin;
          height: 60vmin;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
          filter: blur(10vmin);
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .x-wins ~ .game-over-bg .result-glow {
          background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
        }

        .o-wins ~ .game-over-bg .result-glow {
          background: radial-gradient(circle, rgba(255, 0, 110, 0.3) 0%, transparent 70%);
        }

        @keyframes glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .result-content {
          position: relative;
          text-align: center;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(5vmin); }
          to { opacity: 1; transform: translateY(0); }
        }

        .result-icon {
          width: 12vmin;
          height: 12vmin;
          max-width: 100px;
          max-height: 100px;
          margin: 0 auto 4vmin;
          animation: icon-bounce 0.8s ease-out 0.2s both;
        }

        @keyframes icon-bounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .result-icon svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 4vmin currentColor);
        }

        .result-text {
          font-size: 8vmin;
          font-weight: 800;
          margin: 0 0 6vmin 0;
          letter-spacing: -0.3vmin;
        }

        .result-text.x-wins {
          color: #00d4ff;
          text-shadow: 0 0 5vmin #00d4ff, 0 0 10vmin #00d4ff;
        }

        .result-text.o-wins {
          color: #ff006e;
          text-shadow: 0 0 5vmin #ff006e, 0 0 10vmin #ff006e;
        }

        .result-text.draw {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 4vmin rgba(139, 92, 246, 0.5));
        }

        .result-text.disconnect {
          color: #f59e0b;
          text-shadow: 0 0 5vmin #f59e0b;
        }

        .result-actions {
          display: flex;
          gap: 2vmin;
          justify-content: center;
          animation: slideUp 0.6s ease-out 0.3s both;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 1.5vmin;
          padding: 2vmin 4vmin;
          font-size: 2vmin;
          font-weight: 600;
          border-radius: 2vmin;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: #fff;
          border: none;
          box-shadow: 0 0.5vmin 4vmin rgba(139, 92, 246, 0.4);
        }

        .action-btn.primary:hover {
          transform: translateY(-0.5vmin);
          box-shadow: 0 1vmin 5vmin rgba(139, 92, 246, 0.5);
        }

        .action-btn.secondary {
          background: rgba(255,255,255,0.05);
          color: #aaa;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .action-btn.secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          color: #fff;
        }

        .btn-icon {
          width: 2.5vmin;
          height: 2.5vmin;
        }

        .btn-icon svg {
          width: 100%;
          height: 100%;
        }

        @media (max-width: 480px) {
          .result-text {
            font-size: 10vmin;
          }

          .result-actions {
            flex-direction: column;
            width: 80%;
            max-width: 40vmin;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default GameOver