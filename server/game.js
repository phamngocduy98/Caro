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
