// Ultimate Tic Tac Toe win detection

export const CLASSIC_WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
]

export function checkClassicWinner(board) {
  for (const line of CLASSIC_WINS) {
    const [a,b,c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line }
    }
  }
  if (board.every(c => c !== null)) return { winner: 'draw', line: null }
  return null
}

export function checkUltimateWinner(miniBoards) {
  // miniBoards: array of 9 boards, each is array of 9 cells
  // Each board's winner: 'X', 'O', 'draw', or null
  const resultBoard = miniBoards.map(b => {
    const r = checkClassicWinner(b)
    return r ? r.winner : null
  })
  const mainWins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  for (const line of mainWins) {
    const [a,b,c] = line
    if (resultBoard[a] && resultBoard[a] === resultBoard[b] && resultBoard[a] === resultBoard[c]) {
      return { winner: resultBoard[a], line }
    }
  }
  // Check for draw: all mini-boards decided and no winner
  if (resultBoard.every(r => r !== null)) return { winner: 'draw', line: null }
  return null
}

export function checkMisereWinner(board) {
  const result = checkClassicWinner(board)
  if (result) {
    // In misere, the player who gets 3 in a row LOSES
    if (result.winner === 'X') return { winner: 'O', line: result.line }
    if (result.winner === 'O') return { winner: 'X', line: result.line }
  }
  if (board.every(c => c !== null)) return { winner: 'draw', line: null }
  return null
}

export function generateWildCells() {
  const blocked = []
  const wild = []
  const indices = [0,1,2,3,4,5,6,7,8]
  const shuffled = [...indices].sort(() => Math.random() - 0.5)
  blocked.push(shuffled[0])
  wild.push(shuffled[1], shuffled[2])
  return { blocked, wild }
}