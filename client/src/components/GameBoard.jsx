import Cell from './Cell.jsx'

function GameBoard({ board, onMove, disabled, winningLine }) {
  return (
    <div className="board-container">
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
    </div>
  )
}

export default GameBoard