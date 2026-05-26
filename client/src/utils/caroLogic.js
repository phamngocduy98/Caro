/**
 * Caro (Vietnamese Gomoku) win detection
 * Works for any NxN board — generates all 5-in-a-row lines programmatically
 */

/**
 * Generate all winning lines of exactly 5 consecutive cells for an NxN board
 * @param {number} size - Board dimension (e.g., 15 for 15x15)
 * @returns {number[][]} Array of [a,b,c,d,e] cell index arrays
 */
export function generateCaroWins(size) {
  const wins = []
  const total = size * size

  // Helper: check if a 5-cell segment is within bounds and consecutive in a line
  const addWin = (r, c, dr, dc) => {
    const line = []
    for (let i = 0; i < 5; i++) {
      const idx = (r + i * dr) * size + (c + i * dc)
      line.push(idx)
    }
    wins.push(line)
  }

  // Horizontal lines (left to right)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 5; c++) {
      addWin(r, c, 0, 1) // row, col, dr, dc
    }
  }

  // Vertical lines (top to bottom)
  for (let r = 0; r <= size - 5; r++) {
    for (let c = 0; c < size; c++) {
      addWin(r, c, 1, 0)
    }
  }

  // Diagonal lines (top-left to bottom-right)
  for (let r = 0; r <= size - 5; r++) {
    for (let c = 0; c <= size - 5; c++) {
      addWin(r, c, 1, 1)
    }
  }

  // Anti-diagonal lines (top-right to bottom-left)
  for (let r = 0; r <= size - 5; r++) {
    for (let c = 4; c < size; c++) {
      addWin(r, c, 1, -1)
    }
  }

  return wins
}

// Cache wins by size
const winsCache = new Map()

/**
 * Check for a winner in Caro (5 in a row)
 * @param {string[]} board - Array of cell values (null, 'X', or 'O')
 * @param {number} size - Board dimension
 * @returns {{ winner: string, line: number[] } | { winner: 'draw', line: null } | null}
 */
export function checkCaroWinner(board, size) {
  if (!winsCache.has(size)) {
    winsCache.set(size, generateCaroWins(size))
  }
  const wins = winsCache.get(size)

  for (const line of wins) {
    const [a, b, c, d, e] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === board[d] && board[a] === board[e]) {
      return { winner: board[a], line }
    }
  }

  if (board.every(cell => cell !== null)) {
    return { winner: 'draw', line: null }
  }

  return null
}