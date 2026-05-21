import Cell from './Cell.jsx'

function UltimateBoard({ boards, onMove, disabled, activeBoard, winningBoards, winningCells }) {
  return (
    <div className="ultimate-board">
      {boards.map((board, boardIdx) => {
        const isActive = activeBoard === boardIdx
        const isWon = winningBoards?.includes(boardIdx)
        return (
          <div
            key={boardIdx}
            className={`mini-board ${isActive ? 'active' : ''} ${isWon ? 'won' : ''}`}
          >
            {board.map((cell, cellIdx) => (
              <Cell
                key={cellIdx}
                value={cell}
                onClick={() => onMove(boardIdx, cellIdx)}
                disabled={disabled || !isActive || cell !== null || isWon}
                isWinningCell={winningCells?.some(c => c[0] === boardIdx && c[1] === cellIdx)}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default UltimateBoard