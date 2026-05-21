import Cell from './Cell.jsx'

function WildBoard({ board, wildCells = [], blockedCells = [], onMove, disabled, winningLine }) {
  const isWildCell = (i) => wildCells.includes(i)
  const isBlockedCell = (i) => blockedCells.includes(i)

  return (
    <div className="board">
      {board.map((cell, i) => (
        <div
          key={i}
          className={`wild-cell ${isBlockedCell(i) ? 'blocked' : ''} ${isWildCell(i) && !cell ? 'wild' : ''}`}
          style={isBlockedCell(i) ? { background: '#e5e5ea', cursor: 'not-allowed' } : {}}
          onClick={() => !isBlockedCell(i) && !cell && !disabled && onMove(i)}
        >
          {cell && <span className={`symbol ${cell.toLowerCase()}`}>{cell}</span>}
          {isWildCell(i) && !cell && !isBlockedCell(i) && !disabled && <span style={{fontSize:'12px',color:'#86868b'}}>?</span>}
        </div>
      ))}
    </div>
  )
}

export default WildBoard