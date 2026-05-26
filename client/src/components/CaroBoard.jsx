import { useRef, useState, useEffect, useCallback } from 'react'
export default function CaroBoard({ board, size, onMove, disabled, winningLine }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const needsPanZoom = size > 19

  // Calculate cell size to fit viewport
  const getCellSize = useCallback(() => {
    if (!containerRef.current) return 30
    const container = containerRef.current
    const availW = container.clientWidth - 40
    const availH = container.clientHeight - 40
    return Math.floor(Math.min(availW, availH) / size)
  }, [size])

  const [cellSize, setCellSize] = useState(getCellSize)

  useEffect(() => {
    const update = () => setCellSize(getCellSize())
    window.addEventListener('resize', update)
    update()
    return () => window.removeEventListener('resize', update)
  }, [getCellSize])

  // Reset view when size changes
  useEffect(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [size])

  const handleWheel = useCallback((e) => {
    if (!needsPanZoom) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(s => Math.min(Math.max(s * delta, 0.3), 3))
  }, [needsPanZoom])

  const handleMouseDown = useCallback((e) => {
    if (!needsPanZoom) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }, [needsPanZoom, offset])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Coordinate labels
  const colLabels = []
  for (let c = 0; c < size; c++) {
    colLabels.push(String.fromCharCode(65 + (c % 26)) + (c >= 26 ? String(Math.floor(c / 26)) : ''))
  }

  const boardPx = cellSize * size

  const renderGrid = () => {
    const cells = []
    for (let i = 0; i < size * size; i++) {
      const row = Math.floor(i / size)
      const col = i % size
      const isWin = winningLine && winningLine.includes(i)
      cells.push(
        <div
          key={i}
          onClick={() => !disabled && board[i] === null && onMove(i)}
          style={{
            width: cellSize,
            height: cellSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: cellSize * 0.6,
            fontWeight: 700,
            cursor: disabled || board[i] ? 'not-allowed' : 'pointer',
            background: isWin ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxSizing: 'border-box',
            userSelect: 'none',
            transition: 'background 0.15s',
            color: board[i] === 'X' ? '#00d4ff' : board[i] === 'O' ? '#ff006e' : 'transparent',
            textShadow: board[i] === 'X'
              ? '0 0 3vmin #00d4ff'
              : board[i] === 'O' ? '0 0 3vmin #ff006e' : 'none',
          }}
          className={`caro-cell ${isWin ? 'winning' : ''}`}
        >
          {board[i] && <span className="symbol">{board[i]}</span>}
        </div>
      )
    }
    return cells
  }

  if (needsPanZoom) {
    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Column labels */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 40,
            height: 25,
            display: 'flex',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {colLabels.map((label, i) => (
            <div
              key={i}
              style={{
                width: cellSize,
                textAlign: 'center',
                fontSize: Math.max(8, cellSize * 0.2),
                color: '#555',
                lineHeight: '25px',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Row labels */}
        <div
          style={{
            position: 'absolute',
            top: 25,
            left: 0,
            width: 40,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {Array.from({ length: size }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              style={{
                height: cellSize,
                width: 40,
                textAlign: 'right',
                paddingRight: 4,
                fontSize: Math.max(8, cellSize * 0.2),
                color: '#555',
                lineHeight: `${cellSize}px`,
              }}
            >
              {n}
            </div>
          ))}
        </div>

        {/* Board */}
        <div
          style={{
            position: 'absolute',
            top: 25 + (offset.y + 25),
            left: 40 + offset.x,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
            }}
          >
            {renderGrid()}
          </div>
        </div>
      </div>
    )
  }

  // Standard grid for small boards
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: boardPx,
        aspectRatio: `${boardPx} / ${boardPx}`,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
          gap: 1,
        }}
      >
        {renderGrid()}
      </div>
    </div>
  )
}