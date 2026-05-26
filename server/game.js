// 3D winning lines (3x3x3 cube)
export const TD3_WINS = [
  // Horizontal lines on each layer
  [0,1,2],[3,4,5],[6,7,8],
  [9,10,11],[12,13,14],[15,16,17],
  [18,19,20],[21,22,23],[24,25,26],
  // Vertical lines on each layer
  [0,3,6],[1,4,7],[2,5,8],
  [9,12,15],[10,13,16],[11,14,17],
  [18,21,24],[19,22,25],[20,23,26],
  // Z-axis diagonals (same cell position across layers)
  [0,9,18],[1,10,19],[2,11,20],
  [3,12,21],[4,13,22],[5,14,23],
  [6,15,24],[7,16,25],[8,17,26],
  // Space diagonals
  [0,13,26],[2,13,24],
  [6,13,20],[8,13,18]
]

// Winning combinations for Classic 3x3
export const CLASSIC_WINS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

export function checkWinner(board, wins = CLASSIC_WINS) {
  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(cell => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return null;
}

export function createRoom() {
  return {
    code: generateCode(),
    players: [],
    board: Array(9).fill(null),
    currentTurn: 'X',
    status: 'waiting', // waiting | playing | finished
    gameType: 'classic'
  };
}

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}
