import { useState } from 'react'
import GameBoard from './GameBoard.jsx'
import GameOver from './GameOver.jsx'

function Room({ username, mode, gameType, onLeave }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [currentTurn, setCurrentTurn] = useState('X')
  const [winner, setWinner] = useState(null)
  const [winningLine, setWinningLine] = useState(null)

  const checkWinner = (board) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    for (const line of lines) {
      const [a,b,c] = line
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line }
      }
    }
    if (board.every(c => c !== null)) return { winner: 'draw', line: null }
    return null
  }

  const handleMove = (index) => {
    if (board[index] || winner) return
    const newBoard = [...board]
    newBoard[index] = currentTurn
    setBoard(newBoard)
    const result = checkWinner(newBoard)
    if (result) {
      setWinner(result.winner)
      setWinningLine(result.line)
    } else {
      setCurrentTurn(currentTurn === 'X' ? 'O' : 'X')
    }
  }

  const handlePlayAgain = () => {
    setBoard(Array(9).fill(null))
    setCurrentTurn('X')
    setWinner(null)
    setWinningLine(null)
  }

  if (winner) {
    return <GameOver winner={winner} onPlayAgain={handlePlayAgain} onLeave={onLeave} />
  }

  return (
    <div className="room">
      <p className="turn-indicator">
        {currentTurn === 'X' ? 'X\'s turn' : 'O\'s turn'}
      </p>
      <GameBoard board={board} onMove={handleMove} disabled={!!winner} winningLine={winningLine} />
      <button className="leave-btn" onClick={onLeave}>Leave</button>
    </div>
  )
}

export default Room