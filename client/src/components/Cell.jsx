function Cell({ value, onClick, disabled, isWinningCell }) {
  return (
    <button
      className={`cell ${isWinningCell ? 'winning' : ''} ${isWinningCell && value === 'X' ? 'x-win' : ''} ${isWinningCell && value === 'O' ? 'o-win' : ''}`}
      onClick={onClick}
      disabled={disabled || value !== null}
    >
      {value && <span className={`symbol ${value.toLowerCase()}`}>{value}</span>}
    </button>
  )
}

export default Cell