# Caro Game Mode Design

## Context
Add a Vietnamese Gomoku (Caro) game mode alongside classic Tic Tac Toe. Caro is played on a large grid (default 35×35) where players aim to get 5 in a row. The board size is configurable by the room admin (15/19/25/30/35). No captures — pure line-building strategy.

## Design

### 1. Overview

- **New game type:** `caro` added to `GAME_TYPES` in Lobby
- **Default board:** 35×35, configurable to 15/19/25/30/35
- **Win condition:** 5 in a row (horizontal, vertical, diagonal), with blocking rule
- **AI:** Monte Carlo Tree Search (MCTS) with Caro pattern heuristics
- **No captures** — just connect 5

### 2. Architecture

#### New Files
| File | Purpose |
|------|---------|
| `client/src/components/CaroBoard.jsx` | Renders NxN grid with pan/zoom for large boards |
| `client/src/utils/caroAI.js` | MCTS implementation with Caro pattern-based evaluation |
| `client/src/utils/caroLogic.js` | `checkCaroWinner(board, size)` — variable-size 5-in-a-row detection |

#### Modified Files
| File | Changes |
|------|---------|
| `client/src/components/Lobby.jsx` | Add Caro to `GAME_TYPES`; show board-size dialog on selection |
| `client/src/components/Room.jsx` | Add Caro branch in `renderBoard()`, Caro move handling, Caro AI integration |
| `client/src/utils/gameLogic.js` | Add `checkCaroWinner(board, size)` |
| `server/game.js` | Add `generateCaroWins(size)` — programmatic win lines for any NxN |
| `server/index.js` | Pass `boardSize` with Caro room creation; validate Caro moves server-side |
| `test.mjs` | Add Caro game type tests |

### 3. Caro Logic (`caroLogic.js`)

```js
checkCaroWinner(board, size)
```

- Scans all cells in 4 directions (horizontal, vertical, both diagonals)
- Finds first run of 5 consecutive same symbols → return `{ winner, line: [start, ..., end] }`
- Draw if board full, `null` if game ongoing
- Win lines generated programmatically — works for any board size

### 4. Win Lines Generator (`server/game.js`)

```js
generateCaroWins(size) → number[][]
```

- Generates all winning lines of exactly length 5 for an NxN board
- Scans each row, column, diagonal for consecutive 5-cell sequences
- Returns array of [a,b,c,d,e] index arrays

### 5. Caro AI (`caroAI.js`)

**MCTS with UCB1 and Caro heuristics:**

- **Selection:** UCB1 formula — `wins/visits + C*sqrt(ln(parent_visits)/visits)` where C=1.41
- **Expansion:** All empty cells are legal moves
- **Simulation:** Random playouts boosted by Caro pattern recognition:
  - Open 4 (33331 pattern) → high priority
  - Blocked 4 (23332) → high priority
  - Open 3 (3330 pattern) → medium-high
  - Blocked 3 → medium
- **Backpropagation:** Update visits/wins up the tree
- **Board scaling:**
  - 15×15: full search within time limit
  - 25×25+: focus search on center region initially, expand outward
- **Difficulty:** Controlled by `searchTime` (ms) — 500ms=easy, 2000ms=hard

### 6. Lobby Integration

In `Lobby.jsx`, when Caro is selected from game type grid, a board-size picker appears:

```
Board Size:
[15×15] [19×19] [25×25] [30×30] [35×35]  ← default
```

Selected size passed to `onEnterRoom({ mode, gameType: 'caro', boardSize: N, intent })`.

### 7. CaroBoard Component

`CaroBoard.jsx` renders NxN grid:

| Board Size | Rendering |
|------------|-----------|
| ≤ 19×19 | Standard CSS grid, cells scale with viewport |
| > 19×19 | Pan (mouse drag) + zoom (scroll wheel) enabled |

- Coordinate labels (A-Z, 1-N) along edges for large boards
- Cell size: `min(90vh, 90vw) / boardSize`
- Hover effect on empty cells showing current player's color

### 8. Server Validation

**`create-room` for Caro:**
```js
room.boardSize = boardSize
room.board = Array(boardSize * boardSize).fill(null)
```

**`make-move` for Caro:**
- Validate `cellIndex < boardSize * boardSize`
- Validate cell empty
- Validate correct turn
- Run `checkCaroWinner` server-side → emit `game-over` if won

### 9. State Changes in Room.jsx

For `gameType === 'caro'`:
- `initialRoomState.board` = `Array(boardSize * boardSize).fill(null)`
- `handleMove` calls `checkCaroWinner(newBoard, boardSize)` instead of `checkClassicWinner`
- Bot mode: calls `caroAI.getBestMove(board, size, searchTime)` with 400ms delay
- `renderBoard` returns `<CaroBoard ... />` instead of `<GameBoard />`

### 10. Dependencies

- `caroLogic.js` has no dependencies — pure JS
- `caroAI.js` imports `checkCaroWinner` from `caroLogic.js`
- No new npm packages needed

## Verification

1. Start app → Lobby shows "Caro" in game type grid
2. Click Caro → board size dialog appears
3. Select 15×15 and start local game → 15×15 board renders
4. Play moves → win detection works for all 4 directions
5. Play vs bot (15×15) → MCTS AI responds within time limit
6. Online: create room with Caro 25×25 → opponent joins → game works