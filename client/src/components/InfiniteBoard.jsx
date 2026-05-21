import { useState } from 'react'
import Cell from './Cell.jsx'

function InfiniteBoard({ onMove, disabled, currentTurn }) {
  const [board, setBoard] = useState(Array(9).fill(null)) // starts 3x3
  const [size, setSize] = useState(3)

  const handleMove = (index) => {
    if (board[index]) return
    const newBoard = [...board]
    newBoard[index] = currentTurn
    setBoard(newBoard)
    onMove(index)
  }

  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${size}, 100px)` }}>
      {board.map((cell, i) => (
        <Cell
          key={i}
          value={cell}
          onClick={() => handleMove(i)}
          disabled={disabled || cell !== null}
        />
      ))}
    </div>
  )
}

export default InfiniteBoard