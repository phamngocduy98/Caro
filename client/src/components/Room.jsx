import { useEffect, useReducer, useRef } from 'react'
import GameBoard from './GameBoard.jsx'
import CaroBoard from './CaroBoard.jsx'
import GameOver from './GameOver.jsx'
import { useSocket } from '../hooks/useSocket.js'
import { getBestMove, checkWinner } from '../utils/minimax.js'
import { checkClassicWinner } from '../utils/gameLogic.js'
import { checkCaroWinner } from '../utils/caroLogic.js'
import { getBestMove as getCaroBestMove } from '../utils/caroAI.js'

const INIT = 'INIT'
const JOIN = 'JOIN'
const SET_OPPONENT = 'SET_OPPONENT'
const SET_BOARD = 'SET_BOARD'
const GAME_OVER = 'GAME_OVER'
const PLAY_AGAIN = 'PLAY_AGAIN'
const SET_SYMBOL = 'SET_SYMBOL'

const initialRoomState = {
  board: Array(9).fill(null),
  currentTurn: 'X',
  winner: null,
  winningLine: null,
  roomCode: null,
  opponent: null,
  status: 'connecting',
  playerSymbol: 'X'
}

function roomReducer(state, action) {
  switch (action.type) {
    case INIT:
      return { ...state, roomCode: action.roomCode, status: 'waiting' }
    case JOIN:
      return { ...state, roomCode: action.roomCode, status: 'playing', playerSymbol: action.symbol, currentTurn: 'X' }
    case SET_OPPONENT:
      return { ...state, opponent: action.opponent, status: 'playing' }
    case SET_BOARD:
      return { ...state, board: action.board, currentTurn: action.currentTurn }
    case GAME_OVER:
      return { ...state, winner: action.winner, winningLine: action.line, status: 'finished' }
    case SET_SYMBOL:
      return { ...state, playerSymbol: action.symbol }
    case PLAY_AGAIN:
      return { ...initialRoomState }
    default:
      return state
  }
}

function Room({ username, mode, gameType, boardSize, intent, roomCode: inputRoomCode, onLeave }) {
  const effectiveSize = gameType === 'caro' ? (boardSize || 35) : 3
  const socketRef = useSocket()
  const [state, dispatch] = useReducer(roomReducer, {
    ...initialRoomState,
    board: Array(effectiveSize * effectiveSize).fill(null),
    roomCode: inputRoomCode || null
  })

  const { board, currentTurn, winner, winningLine, roomCode, opponent, status, playerSymbol } = state

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    socket.off('room-created')
    socket.off('room-joined')
    socket.off('matched')
    socket.off('player-joined')
    socket.off('move-made')
    socket.off('game-over')
    socket.off('opponent-disconnected')
    socket.off('error')

    socket.on('room-created', ({ roomCode }) => {
      dispatch({ type: INIT, roomCode })
    })
    socket.on('room-joined', ({ roomCode, symbol }) => {
      dispatch({ type: JOIN, roomCode, symbol })
    })
    socket.on('matched', ({ roomCode, opponent, symbol }) => {
      dispatch({ type: INIT, roomCode })
      dispatch({ type: SET_OPPONENT, opponent })
      dispatch({ type: JOIN, roomCode, symbol })
    })
    socket.on('player-joined', ({ player }) => {
      dispatch({ type: SET_OPPONENT, opponent: player })
    })
    socket.on('move-made', ({ board, currentTurn }) => {
      dispatch({ type: SET_BOARD, board, currentTurn })
    })
    socket.on('game-over', ({ winner, line }) => {
      dispatch({ type: GAME_OVER, winner, line })
    })
    socket.on('opponent-disconnected', () => {
      dispatch({ type: GAME_OVER, winner: 'opponent_left', line: null })
    })
    socket.on('error', ({ message }) => alert(message))

    return () => {
      socket.off('room-created')
      socket.off('room-joined')
      socket.off('matched')
      socket.off('player-joined')
      socket.off('move-made')
      socket.off('game-over')
      socket.off('opponent-disconnected')
      socket.off('error')
    }
  }, [socketRef])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || mode !== 'online') return

    if (intent === 'create') {
      socket.emit('create-room', { username, gameType, boardSize: effectiveSize })
    } else if (intent === 'join') {
      socket.emit('join-room', { roomCode: inputRoomCode, username })
    } else if (intent === 'auto-match') {
      socket.emit('auto-match', { username, gameType, boardSize: effectiveSize })
    }
  }, [mode, intent, username, gameType, inputRoomCode, socketRef, effectiveSize])

  useEffect(() => {
    if (mode === 'bot' && (gameType === 'classic' || gameType === 'caro')) {
      dispatch({ type: SET_SYMBOL, symbol: 'X' })
    }
  }, [mode, gameType])

  const handleMove = (index) => {
    if (board[index] || winner) return

    if (mode === 'online') {
      socketRef.current?.emit('make-move', { cellIndex: index, gameType })
      return
    }

    const newBoard = [...board]
    newBoard[index] = currentTurn

    let result
    if (gameType === 'caro') {
      result = checkCaroWinner(newBoard, effectiveSize)
    } else {
      result = checkClassicWinner(newBoard)
    }

    if (result) {
      dispatch({ type: GAME_OVER, winner: result.winner, line: result.line })
    } else {
      const nextTurn = currentTurn === 'X' ? 'O' : 'X'
      dispatch({ type: SET_BOARD, board: newBoard, currentTurn: nextTurn })

      if (mode === 'bot' && nextTurn === 'O') {
        setTimeout(() => {
          let botMove
          if (gameType === 'caro') {
            botMove = getCaroBestMove([...newBoard], effectiveSize, 1500)
          } else {
            botMove = getBestMove([...newBoard])
          }
          if (botMove !== null) {
            const botBoard = [...newBoard]
            botBoard[botMove] = 'O'
            let botResult
            if (gameType === 'caro') {
              botResult = checkCaroWinner(botBoard, effectiveSize)
            } else {
              botResult = checkClassicWinner(botBoard)
            }
            if (botResult) {
              dispatch({ type: GAME_OVER, winner: botResult.winner, line: botResult.line })
            } else {
              dispatch({ type: SET_BOARD, board: botBoard, currentTurn: 'X' })
            }
          }
        }, 400)
      }
    }
  }

  const handlePlayAgain = () => {
    dispatch({ type: PLAY_AGAIN })
  }

  if (status === 'finished' || winner) {
    return (
      <div className="game-room">
        <div className="room-bg">
          <div className="grid-overlay"></div>
          <div className="glow-orb glow-orb-1"></div>
          <div className="glow-orb glow-orb-2"></div>
        </div>
        <GameOver
          winner={winner}
          onPlayAgain={mode === 'local' ? handlePlayAgain : () => {}}
          onLeave={onLeave}
        />
        <style>{gameRoomStyles}</style>
      </div>
    )
  }

  const isMyTurn = mode === 'local' ? true : currentTurn === playerSymbol

  const renderBoard = () => {
    if (gameType === 'caro') {
      return (
        <CaroBoard
          board={board}
          size={effectiveSize}
          onMove={handleMove}
          disabled={!!winner}
          winningLine={winningLine}
        />
      )
    }
    return (
      <GameBoard
        board={board}
        onMove={handleMove}
        disabled={!!winner}
        winningLine={winningLine}
      />
    )
  }

  return (
    <div className="game-room">
      <div className="room-bg">
        <div className="grid-overlay"></div>
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
      </div>

      <div className="room-container">
        <header className="room-header">
          <button className="leave-btn" onClick={onLeave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Leave
          </button>

          {roomCode && (
            <div className="room-code-badge">
              <span className="code-label">ROOM</span>
              <span className="code-value">{roomCode}</span>
            </div>
          )}
        </header>

        <div className="game-area">
          <div className="player-panel left">
            <div className={`player-avatar ${currentTurn === 'X' && isMyTurn ? 'active' : ''}`}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="player-details">
              <span className="player-name">{username}</span>
              <span className="player-symbol">
                <span className="symbol-x">X</span>
              </span>
            </div>
            {currentTurn === 'X' && <div className="turn-indicator active"></div>}
          </div>

          <div className="board-section">
            <div className="vs-badge">
              <span className="vs-text">VS</span>
            </div>
            {renderBoard()}
            <div className="turn-display">
              <span className={`turn-label ${currentTurn === 'X' ? 'x' : 'o'}`}>
                {currentTurn === 'X' ? 'X' : 'O'}'s Turn
              </span>
            </div>
          </div>

          <div className="player-panel right">
            <div className={`player-avatar ${currentTurn === 'O' && isMyTurn ? 'active' : ''} ${!opponent ? 'empty' : ''}`}>
              {opponent ? opponent.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="player-details">
              <span className="player-name">{opponent || 'Waiting...'}</span>
              <span className="player-symbol">
                <span className="symbol-o">O</span>
              </span>
            </div>
            {currentTurn === 'O' && opponent && <div className="turn-indicator active"></div>}
          </div>
        </div>

        <div className="game-footer">
          <div className="mode-badge">
            <span className="mode-icon">{mode === 'local' ? '⌘' : mode === 'bot' ? '◧' : '◈'}</span>
            <span className="mode-text">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
          </div>
          <div className="type-badge">
            {gameType === 'caro' ? `Caro ${effectiveSize}×${effectiveSize}` : gameType.charAt(0).toUpperCase() + gameType.slice(1)}
          </div>
        </div>
      </div>

      <style>{gameRoomStyles}</style>
    </div>
  )
}

const gameRoomStyles = `
  .game-room {
    min-height: 100vh;
    min-height: 100dvh;
    position: relative;
    overflow: hidden;
    background: #050508;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .room-bg {
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
    opacity: 0.25;
  }

  .glow-orb-1 {
    width: 70vmin;
    height: 70vmin;
    background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%);
    top: -25vmin;
    left: -20vmin;
  }

  .glow-orb-2 {
    width: 60vmin;
    height: 60vmin;
    background: radial-gradient(circle, rgba(255, 0, 110, 0.15) 0%, transparent 70%);
    bottom: -20vmin;
    right: -20vmin;
  }

  .room-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 95vmin;
    padding: 4vmin 2vmin;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4vmin;
  }

  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .leave-btn {
    display: flex;
    align-items: center;
    gap: 1vmin;
    padding: 1.5vmin 2.5vmin;
    font-size: 1.6vmin;
    font-weight: 500;
    color: #8a8a9a;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 1.5vmin;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .leave-btn:hover {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.1);
  }

  .leave-btn svg {
    width: 2vmin;
    height: 2vmin;
  }

  .room-code-badge {
    display: flex;
    align-items: center;
    gap: 1.5vmin;
    padding: 1.2vmin 2vmin;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 1.5vmin;
  }

  .code-label {
    font-size: 1.2vmin;
    letter-spacing: 0.3vmin;
    color: #666;
    font-weight: 600;
  }

  .code-value {
    font-size: 2vmin;
    font-weight: 700;
    letter-spacing: 0.5vmin;
    color: #8b5cf6;
  }

  .game-area {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5vmin;
    width: 100%;
  }

  .player-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2vmin;
    min-width: 15vmin;
    position: relative;
  }

  .player-avatar {
    width: 10vmin;
    height: 10vmin;
    max-width: 80px;
    max-height: 80px;
    min-width: 50px;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5vmin;
    font-weight: 700;
    background: linear-gradient(135deg, #1a1a2e, #16162a);
    border: 2px solid rgba(255,255,255,0.1);
    border-radius: 2.5vmin;
    transition: all 0.3s ease;
  }

  .player-avatar.active {
    border-color: #8b5cf6;
    box-shadow: 0 0 4vmin rgba(139, 92, 246, 0.4);
    animation: avatar-pulse 2s ease-in-out infinite;
  }

  @keyframes avatar-pulse {
    0%, 100% { box-shadow: 0 0 3vmin rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 5vmin rgba(139, 92, 246, 0.5); }
  }

  .player-avatar.empty {
    opacity: 0.4;
    background: rgba(255,255,255,0.02);
    border-style: dashed;
  }

  .player-details {
    text-align: center;
  }

  .player-name {
    display: block;
    font-size: 1.8vmin;
    font-weight: 600;
    color: #fff;
    margin-bottom: 1vmin;
    max-width: 15vmin;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .player-symbol {
    font-size: 3vmin;
    font-weight: 700;
  }

  .symbol-x {
    color: #00d4ff;
    text-shadow: 0 0 3vmin #00d4ff;
  }

  .symbol-o {
    color: #ff006e;
    text-shadow: 0 0 3vmin #ff006e;
  }

  .turn-indicator {
    width: 1.2vmin;
    height: 1.2vmin;
    border-radius: 50%;
    background: #8b5cf6;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .turn-indicator.active {
    opacity: 1;
    animation: pulse-dot 1.5s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
  }

  .board-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3vmin;
  }

  .vs-badge {
    width: 7vmin;
    height: 7vmin;
    max-width: 60px;
    max-height: 60px;
    min-width: 45px;
    min-height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    border-radius: 2vmin;
    box-shadow: 0 0.5vmin 3vmin rgba(139, 92, 246, 0.4);
  }

  .vs-text {
    font-size: 1.8vmin;
    font-weight: 800;
    letter-spacing: 0.3vmin;
    color: #fff;
  }

  .board-container {
    background: rgba(26, 26, 46, 0.8);
    padding: 2.5vmin;
    border-radius: 3.5vmin;
    border: 2px solid rgba(139, 92, 246, 0.2);
    box-shadow:
      0 0 8vmin rgba(139, 92, 246, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }

  .board {
    display: grid;
    grid-template-columns: repeat(3, 15vmin);
    grid-template-rows: repeat(3, 15vmin);
    gap: 1.5vmin;
  }

  .cell {
    width: 15vmin;
    height: 15vmin;
    max-width: 140px;
    max-height: 140px;
    min-width: 70px;
    min-height: 70px;
    font-size: 7vmin;
    font-weight: 700;
    border: none;
    border-radius: 2.5vmin;
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .cell::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 2.5vmin;
    background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
    pointer-events: none;
  }

  .cell:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-0.5vmin);
    box-shadow: 0 1vmin 3vmin rgba(0, 0, 0, 0.3);
  }

  .cell:disabled {
    cursor: not-allowed;
  }

  .cell.winning {
    animation: win-cell 0.8s ease-in-out infinite;
  }

  .cell.winning.x-win {
    background: rgba(0, 212, 255, 0.15);
    box-shadow: 0 0 4vmin rgba(0, 212, 255, 0.4);
  }

  .cell.winning.o-win {
    background: rgba(255, 0, 110, 0.15);
    box-shadow: 0 0 4vmin rgba(255, 0, 110, 0.4);
  }

  @keyframes win-cell {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .symbol {
    position: relative;
    z-index: 1;
  }

  .symbol.x {
    color: #00d4ff;
    text-shadow: 0 0 3vmin #00d4ff, 0 0 5vmin #00d4ff;
  }

  .symbol.o {
    color: #ff006e;
    text-shadow: 0 0 3vmin #ff006e, 0 0 5vmin #ff006e;
  }

  .turn-display {
    text-align: center;
  }

  .turn-label {
    font-size: 2vmin;
    font-weight: 700;
    padding: 1vmin 3vmin;
    border-radius: 3vmin;
    background: rgba(255,255,255,0.05);
  }

  .turn-label.x {
    color: #00d4ff;
    text-shadow: 0 0 3vmin #00d4ff;
  }

  .turn-label.o {
    color: #ff006e;
    text-shadow: 0 0 3vmin #ff006e;
  }

  .game-footer {
    display: flex;
    justify-content: center;
    gap: 2vmin;
  }

  .mode-badge, .type-badge {
    display: flex;
    align-items: center;
    gap: 1vmin;
    padding: 1.2vmin 2vmin;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 1.5vmin;
    font-size: 1.5vmin;
    font-weight: 500;
    color: #666;
  }

  .mode-icon {
    font-size: 1.8vmin;
  }

  @media (max-width: 800px) {
    .game-area {
      flex-direction: column;
      gap: 4vmin;
    }

    .player-panel {
      flex-direction: row;
      min-width: auto;
    }

    .player-panel.left {
      order: 1;
    }

    .player-panel.right {
      order: 3;
    }

    .board-section {
      order: 2;
    }

    .board {
      grid-template-columns: repeat(3, 14vmin);
      grid-template-rows: repeat(3, 14vmin);
      gap: 1.2vmin;
    }

    .cell {
      font-size: 6vmin;
      border-radius: 2vmin;
    }
  }

  @media (max-width: 480px) {
    .board {
      grid-template-columns: repeat(3, 12vmin);
      grid-template-rows: repeat(3, 12vmin);
      gap: 1vmin;
    }

    .cell {
      font-size: 5vmin;
      border-radius: 1.5vmin;
    }

    .board-container {
      padding: 2vmin;
    }
  }
`

export default Room