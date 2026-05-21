import Cell from './Cell.jsx'

function ThreeDBoard({ board, onMove, disabled, winningLine }) {
  // board: array of 27 elements (3 layers of 9)
  const layers = [
    { name: 'Layer 1', cells: board.slice(0, 9), startIdx: 0 },
    { name: 'Layer 2', cells: board.slice(9, 18), startIdx: 9 },
    { name: 'Layer 3', cells: board.slice(18, 27), startIdx: 18 }
  ]

  return (
    <div className="three-d-board">
      {layers.map((layer) => (
        <div key={layer.startIdx} className="layer">
          <h4>{layer.name}</h4>
          <div className="board">
            {layer.cells.map((cell, cellIdx) => (
              <Cell
                key={cellIdx}
                value={cell}
                onClick={() => onMove(layer.startIdx + cellIdx)}
                disabled={disabled || cell !== null}
                isWinningCell={winningLine?.includes(layer.startIdx + cellIdx)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ThreeDBoard