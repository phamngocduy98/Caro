function GameOver({ winner, onPlayAgain, onLeave }) {
  const message = winner === 'draw' ? "It's a Draw!" : `${winner} Wins!`
  return (
    <div className="game-over">
      <h2>{message}</h2>
      <div className="game-over-buttons">
        <button onClick={onPlayAgain}>Play Again</button>
        <button onClick={onLeave}>Leave</button>
      </div>
    </div>
  )
}

export default GameOver