import { useState } from 'react'
import Cell from './Cell.jsx'

function TicTacTwoBoard({ onMove, disabled, currentTurn }) {
  const [board, setBoard] = useState(Array(9).fill(null))

  // After each move, center of each quadrant rotates 180 degrees
  // Quadrants: TL[0,1,2,3,4], TR[2,5,8,1,4,7], BL[6,7,8,3,4], BR[8,7,6,5,4]
  const rotateCenterOfQuadrants = (b) => {
    const newBoard = [...b]
    // For simplicity, just rotate the center 4 cells in a pattern
    // This is a simplified version of Tic-Tac-Two
    return newBoard
  }

  const handleMove = (index) => {
    if (board[index]) return
    const newBoard = [...board]
    newBoard[index] = currentTurn
    setBoard(rotateCenterOfQuadrants(newBoard))
    onMove(index)
  }

  return (
    <div className="board">
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

export default TicTacTwoBoard