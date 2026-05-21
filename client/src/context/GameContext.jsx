import { createContext, useContext, useState } from 'react'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    currentTurn: 'X',
    winner: null,
    winningLine: null,
    roomCode: null,
    opponent: null,
    status: 'idle' // idle | waiting | playing | finished
  })

  return <GameContext.Provider value={{ gameState, setGameState }}>{children}</GameContext.Provider>
}

export const useGame = () => useContext(GameContext)