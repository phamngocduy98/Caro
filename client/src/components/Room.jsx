import { useEffect, useState } from 'react'
import GameBoard from './GameBoard.jsx'
import UltimateBoard from './UltimateBoard.jsx'
import ThreeDBoard from './ThreeDBoard.jsx'
import WildBoard from './WildBoard.jsx'
import TicTacTwoBoard from './TicTacTwoBoard.jsx'
import InfiniteBoard from './InfiniteBoard.jsx'
import GameOver from './GameOver.jsx'
import { useSocket } from '../hooks/useSocket.js'
import { getBestMove, checkWinner } from '../utils/minimax.js'
import { checkClassicWinner, generateWildCells } from '../utils/gameLogic.js'

function Room({ username, mode, gameType, action, inputRoomCode, onLeave }) {
  const socketRef = useSocket()
  const [board, setBoard] = useState(Array(9).fill(null))
  const [currentTurn, setCurrentTurn] = useState('X')
  const [winner, setWinner] = useState(null)
  const [winningLine, setWinningLine] = useState(null)
  const [roomCode, setRoomCode] = useState(inputRoomCode || null)
  const [opponent, setOpponent] = useState(null)
  const [status, setStatus] = useState('playing') // connecting | waiting | playing | finished
  const [wildCells, setWildCells] = useState({ blocked: [], wild: [] })
  const [playerSymbol, setPlayerSymbol] = useState('X')

  // Ultimate board state
  const [ultimateBoards, setUltimateBoards] = useState(() => Array(9).fill(null).map(() => Array(9).fill(null)))
  const [activeBoard, setActiveBoard] = useState(-1) // -1 means any board

  useEffect(() => {
    if (!socketRef.current) return
    const socket = socketRef.current

    if (mode === 'online' && socket) {
      if (action === 'create') {
        socket.emit('create-room', { username, gameType })
      } else if (action === 'join') {
        socket.emit('join-room', { roomCode: inputRoomCode, username })
      } else if (action === 'auto-match') {
        socket.emit('auto-match', { username, gameType })
      }

      socket.on('room-created', ({ roomCode }) => {
        setRoomCode(roomCode)
        setStatus('waiting')
      })
      socket.on('room-joined', () => {
        setRoomCode(inputRoomCode)
        setStatus('playing')
        setCurrentTurn('X')
      })
      socket.on('matched', ({ roomCode, opponent }) => {
        setRoomCode(roomCode)
        setOpponent(opponent)
        setStatus('playing')
        setCurrentTurn('X')
      })
      socket.on('player-joined', ({ player }) => {
        setOpponent(player)
        setStatus('playing')
      })
      socket.on('move-made', ({ cellIndex, board: newBoard, currentTurn: turn }) => {
        setBoard(newBoard)
        setCurrentTurn(turn)
      })
      socket.on('game-over', ({ winner }) => {
        setWinner(winner)
        setStatus('finished')
      })
      socket.on('opponent-disconnected', () => {
        setWinner('opponent_left')
        setStatus('finished')
      })
      socket.on('error', ({ message }) => alert(message))
    }

    if (mode === 'bot' && gameType === 'classic') {
      setPlayerSymbol('X')
    }

    if (gameType === 'wild') {
      setWildCells(generateWildCells())
    }

    return () => {
      if (socket) {
        socket.off('room-created')
        socket.off('room-joined')
        socket.off('matched')
        socket.off('player-joined')
        socket.off('move-made')
        socket.off('game-over')
        socket.off('opponent-disconnected')
        socket.off('error')
      }
    }
  }, [socketRef.current, mode, action])

  const handleMove = (index) => {
    if (board[index] || winner) return

    if (mode === 'online') {
      socketRef.current?.emit('make-move', { cellIndex: index, gameType })
    }

    // Local/bot move (optimistic update for local)
    const newBoard = [...board]
    newBoard[index] = currentTurn
    setBoard(newBoard)

    const result = checkClassicWinner(newBoard)
    if (result) {
      setWinner(result.winner)
      setWinningLine(result.line)
    } else {
      setCurrentTurn(currentTurn === 'X' ? 'O' : 'X')

      // Bot move
      if (mode === 'bot' && currentTurn === 'X') {
        setTimeout(() => {
          const botMove = getBestMove([...newBoard])
          if (botMove !== null) {
            const botBoard = [...newBoard]
            botBoard[botMove] = 'O'
            setBoard(botBoard)
            const botResult = checkClassicWinner(botBoard)
            if (botResult) {
              setWinner(botResult.winner)
              setWinningLine(botResult.line)
            } else {
              setCurrentTurn('X')
            }
          }
        }, 500)
      }
    }
  }

  const handlePlayAgain = () => {
    setBoard(Array(9).fill(null))
    setCurrentTurn('X')
    setWinner(null)
    setWinningLine(null)
    setStatus('playing')
    if (gameType === 'wild') setWildCells(generateWildCells())
  }

  if (status === 'finished' || winner) {
    return (
      <GameOver
        winner={winner}
        onPlayAgain={mode === 'local' ? handlePlayAgain : () => {}}
        onLeave={onLeave}
      />
    )
  }

  const isMyTurn = currentTurn === playerSymbol

  const renderBoard = () => {
    if (gameType === 'ultimate') {
      return (
        <UltimateBoard
          boards={ultimateBoards}
          onMove={(bi, ci) => {}}
          disabled={!!winner || !isMyTurn}
          activeBoard={activeBoard}
        />
      )
    }
    if (gameType === '3d') {
      return <ThreeDBoard board={board} onMove={handleMove} disabled={!!winner || !isMyTurn} winningLine={winningLine} />
    }
    if (gameType === 'wild') {
      return (
        <WildBoard
          board={board}
          wildCells={wildCells.wild}
          blockedCells={wildCells.blocked}
          onMove={handleMove}
          disabled={!!winner || !isMyTurn}
          winningLine={winningLine}
        />
      )
    }
    if (gameType === 'tictactwo') {
      return <TicTacTwoBoard onMove={handleMove} disabled={!!winner || !isMyTurn} currentTurn={currentTurn} />
    }
    if (gameType === 'infinite') {
      return <InfiniteBoard onMove={handleMove} disabled={!!winner || !isMyTurn} currentTurn={currentTurn} />
    }
    return (
      <GameBoard
        board={board}
        onMove={handleMove}
        disabled={!!winner || !isMyTurn}
        winningLine={winningLine}
      />
    )
  }

  return (
    <div className="room">
      {roomCode && <p className="room-code">Room: {roomCode}</p>}
      {opponent && <p>Playing vs {opponent}</p>}
      <p className="turn-indicator">
        {isMyTurn ? 'Your turn' : "Opponent's turn"} ({currentTurn})
      </p>
      {renderBoard()}
      <button className="leave-btn" onClick={onLeave}>Leave</button>
    </div>
  )
}

export default Room