import Cell from './Cell.jsx'

const WINNING_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
]

function GameBoard({ board, onMove, disabled, winningLine }) {
  return (
    <div className="board">
      {board.map((cell, i) => (
        <Cell
          key={i}
          value={cell}
          onClick={() => onMove(i)}
          disabled={disabled}
          isWinningCell={winningLine?.includes(i)}
        />
      ))}
    </div>
  )
}

export default GameBoard