const WINNING_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
]

export function checkWinner(board) {
  for (const line of WINNING_LINES) {
    const [a,b,c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line }
    }
  }
  if (board.every(c => c !== null)) return { winner: 'draw', line: null }
  return null
}

function getAvailableMoves(board) {
  return board.reduce((acc, cell, i) => {
    if (cell === null) acc.push(i)
    return acc
  }, [])
}

function minimax(board, depth, isMaximizing, alpha, beta) {
  const result = checkWinner(board)
  if (result) {
    if (result.winner === 'O') return 10 - depth
    if (result.winner === 'X') return depth - 10
    return 0
  }

  const moves = getAvailableMoves(board)
  if (moves.length === 0) return 0

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      board[move] = 'O'
      const eval_ = minimax(board, depth + 1, false, alpha, beta)
      board[move] = null
      maxEval = Math.max(maxEval, eval_)
      alpha = Math.max(alpha, eval_)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      board[move] = 'X'
      const eval_ = minimax(board, depth + 1, true, alpha, beta)
      board[move] = null
      minEval = Math.min(minEval, eval_)
      beta = Math.min(beta, eval_)
      if (beta <= alpha) break
    }
    return minEval
  }
}

export function getBestMove(board) {
  let bestMove = null
  let bestValue = -Infinity

  for (const move of getAvailableMoves(board)) {
    board[move] = 'O'
    const value = minimax([...board], 0, false, -Infinity, Infinity)
    board[move] = null
    if (value > bestValue) {
      bestValue = value
      bestMove = move
    }
  }
  return bestMove
}
