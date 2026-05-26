import { checkCaroWinner } from './caroLogic.js'

/**
 * Monte Carlo Tree Search AI for Caro
 *
 * Uses UCB1 for tree exploration + Caro pattern-based evaluation for simulation.
 * Difficulty controlled by searchTime (ms).
 */

/**
 * Count consecutive symbols in a direction from a position
 */
function countConsecutive(board, size, row, col, dr, dc, symbol) {
  let count = 0
  let r = row + dr
  let c = col + dc
  while (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === symbol) {
    count++
    r += dr
    c += dc
  }
  return count
}

/**
 * Check what pattern exists at a position (for Caro heuristics)
 * Returns: 'win', 'open4', 'blocked4', 'open3', 'blocked3', 'open2', 'blocked2', 'none'
 */
function analyzePoint(board, size, row, col, symbol) {
  const opponent = symbol === 'X' ? 'O' : 'X'
  const idx = row * size + col
  if (board[idx] !== null) return null

  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal \
    [1, -1],  // diagonal /
  ]

  let bestPattern = 'none'

  for (const [dr, dc] of directions) {
    // Count in both directions
    const countPos = countConsecutive(board, size, row, col, dr, dc, symbol)
    const countNeg = countConsecutive(board, size, row, col, -dr, -dc, symbol)
    const total = countPos + countNeg + 1 // +1 for the point itself

    if (total >= 5) {
      // Open at positive end?
      const rPos = row + (countPos + 1) * dr
      const cPos = col + (countPos + 1) * dc
      const openPos = rPos >= 0 && rPos < size && cPos >= 0 && cPos < size && board[rPos * size + cPos] === null

      // Open at negative end?
      const rNeg = row - (countNeg + 1) * dr
      const cNeg = col - (countNeg + 1) * dc
      const openNeg = rNeg >= 0 && rNeg < size && cNeg >= 0 && cNeg < size && board[rNeg * size + cNeg] === null

      if (total === 5) return 'win'
      if (total === 4) {
        if (openPos && openNeg) return 'open4'
        if (openPos || openNeg) return 'blocked4'
      }
      if (total === 3) {
        if (openPos && openNeg) return 'open3'
        if (openPos || openNeg) return 'blocked3'
      }
      if (total === 2) {
        if (openPos && openNeg) return 'open2'
        if (openPos || openNeg) return 'blocked2'
      }
    }
  }

  return bestPattern
}

/**
 * Evaluate a board position for simulation purposes
 * Higher = better for the player
 */
function evaluateBoard(board, size, player) {
  const opponent = player === 'X' ? 'O' : 'X'
  const patternWeights = {
    win: 100000,
    open4: 10000,
    blocked4: 1000,
    open3: 1000,
    blocked3: 100,
    open2: 100,
    blocked2: 10,
    none: 1,
  }

  let score = 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const sym = board[r * size + c]
      if (sym === null) continue
      const weight = patternWeights[analyzePoint(board, size, r, c, sym) || 'none']
      if (sym === player) {
        score += weight
      } else {
        score -= weight * 1.1 // Slight preference for offensive play
      }
    }
  }
  return score
}

/**
 * Create a new MCTS node
 */
function createNode(board, size, move = null, parent = null) {
  return {
    board: board.slice(),
    size,
    move,
    visits: 0,
    wins: 0,
    children: [],
    parent,
    untriedMoves: null, // Lazily initialized
  }
}

/**
 * Get all legal moves, sorted by Caro heuristics (best first)
 */
function getOrderedMoves(board, size, player) {
  const moves = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const idx = r * size + c
      if (board[idx] !== null) continue

      // Prefer moves near existing pieces
      let minDist = Infinity
      for (let r2 = 0; r2 < size; r2++) {
        for (let c2 = 0; c2 < size; c2++) {
          if (board[r2 * size + c2] !== null) {
            const dist = Math.abs(r2 - r) + Math.abs(c2 - c)
            minDist = Math.min(minDist, dist)
          }
        }
      }

      // Skip moves more than 3 cells away from any piece
      if (minDist > 3) continue

      const pattern = analyzePoint(board, size, r, c, player)
      let priority = 0
      if (pattern === 'win') priority = 1000000
      else if (pattern === 'open4') priority = 500000
      else if (pattern === 'blocked4') priority = 100000
      else if (pattern === 'open3') priority = 50000
      else if (pattern === 'blocked3') priority = 10000
      else if (pattern === 'open2') priority = 5000
      else if (pattern === 'blocked2') priority = 1000
      else priority = 100 + (10 - minDist) * 10

      moves.push({ idx, priority })
    }
  }

  // Sort by priority descending, take top N for performance
  moves.sort((a, b) => b.priority - a.priority)
  const maxMoves = Math.min(moves.length, Math.max(20, Math.floor(size * size * 0.15)))
  return moves.slice(0, maxMoves).map(m => m.idx)
}

/**
 * UCB1 value for selection phase
 */
function ucb1(node, parentVisits, exploration = 1.41) {
  if (node.visits === 0) return Infinity
  return (node.wins / node.visits) + exploration * Math.sqrt(Math.log(parentVisits) / node.visits)
}

/**
 * Selection: descend tree using UCB1 until node is not fully expanded
 */
function select(node) {
  while (node.children.length > 0 && node.untriedMoves === null) {
    let bestChild = null
    let bestValue = -Infinity
    for (const child of node.children) {
      const val = ucb1(child, node.visits)
      if (val > bestValue) {
        bestValue = val
        bestChild = child
      }
    }
    node = bestChild
  }
  return node
}

/**
 * Expansion: add one untried move as a child
 */
function expand(node, player) {
  if (node.untriedMoves === null) {
    node.untriedMoves = getOrderedMoves(node.board, node.size, player)
  }

  if (node.untriedMoves.length === 0) return node

  const moveIdx = node.untriedMoves.pop()
  const newBoard = node.board.slice()
  newBoard[moveIdx] = player

  const child = createNode(newBoard, node.size, moveIdx, node)
  node.children.push(child)
  return child
}

/**
 * Simulation: play random moves until game end, return winner
 */
function simulate(board, size) {
  let player = 'X'
  let current = board.slice()
  let passes = 0
  const maxPasses = size > 20 ? 5 : 2 // Allow some passes for large boards

  for (let turn = 0; turn < size * size * 2; turn++) {
    const result = checkCaroWinner(current, size)
    if (result) return result.winner

    const moves = getOrderedMoves(current, size, player)
    if (moves.length === 0) {
      passes++
      if (passes >= maxPasses) return 'draw'
      player = player === 'X' ? 'O' : 'X'
      continue
    }
    passes = 0

    // Pick from top 30% of moves (with some randomness)
    const topN = Math.max(1, Math.floor(moves.length * 0.3))
    const choice = moves[Math.floor(Math.random() * topN)]

    current = current.slice()
    current[choice] = player
    player = player === 'X' ? 'O' : 'X'
  }

  return 'draw'
}

/**
 * Backpropagation: update stats up the tree
 */
function backpropagate(node, result) {
  while (node !== null) {
    node.visits++
    // For O (AI), a win is good. For X (human), we track from O's perspective
    if (result === 'O') {
      node.wins++
    } else if (result === 'draw') {
      node.wins += 0.5
    }
    // X win = no change to node.wins (node.wins stays same)
    node = node.parent
  }
}

/**
 * Run MCTS for a given time limit
 */
function runMCTS(rootBoard, size, searchTime = 1000) {
  const startTime = Date.now()
  const root = createNode(rootBoard, size)
  let player = 'O' // AI is O
  let iteration = 0

  while (Date.now() - startTime < searchTime) {
    iteration++
    let node = select(root)
    const otherPlayer = node.board.filter(c => c !== null).length % 2 === 0 ? 'X' : 'O'

    // Expand
    node = expand(node, otherPlayer)

    // Simulate
    const result = simulate(node.board, node.size)

    // Backpropagate
    backpropagate(node, result)
  }

  // Pick best child (most visits)
  let bestChild = null
  let bestVisits = -1
  for (const child of root.children) {
    if (child.visits > bestVisits) {
      bestVisits = child.visits
      bestChild = child
    }
  }

  if (!bestChild) {
    // Fallback: pick center-ish move
    const moves = getOrderedMoves(rootBoard, size, 'O')
    return moves.length > 0 ? moves[0] : Math.floor(size * size / 2)
  }

  return bestChild.move
}

/**
 * Get best move for Caro AI
 * @param {string[]} board - Current board state
 * @param {number} size - Board size
 * @param {number} searchTime - Search time in ms (default 1500)
 * @returns {number} Index of best move
 */
export function getBestMove(board, size, searchTime = 1500) {
  // If board is empty, pick a good opening (center-ish)
  const filledCount = board.filter(c => c !== null).length
  if (filledCount === 0) {
    const center = Math.floor(size / 2)
    return center * size + center
  }

  // If only 1 move, take it
  const emptyCount = board.filter(c => c === null).length
  if (emptyCount === 1) {
    return board.findIndex(c => c === null)
  }

  // Run MCTS
  return runMCTS(board, size, searchTime)
}