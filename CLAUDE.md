# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time multiplayer Tic Tac Toe game with 7 game types and 3 play modes, built as a monorepo with Node.js backend and React frontend.

## Commands

```bash
# Install all dependencies
npm run install:all

# Run both server and client concurrently
npm run dev

# Run server only (port 3001)
npm run server

# Run client only (port 5173)
npm run client

# Run Playwright tests
node test.mjs
```

## Architecture

### Monorepo Structure
```
/client   - React + Vite frontend (port 5173)
/server   - Node.js + Express + Socket.io backend (port 3001)
```

### Client Architecture
- **App.jsx** - Top-level router with 3 screens: login, lobby, room
- **Room.jsx** - Central game component handling local/bot/online modes. `mode` prop determines behavior:
  - `local`: Both players on same device, alternating turns
  - `bot`: Player vs Minimax AI (unbeatable)
  - `online`: WebSocket multiplayer via Socket.io
- **useSocket.js** - Socket.io connection hook; socket is created once and shared
- **GameContext.jsx** - Provides shared game state; currently wraps App but Room manages its own state independently
- **gameLogic.js** - `checkClassicWinner`, `checkUltimateWinner`, `checkMisereWinner`, `generateWildCells`

### Server Architecture (server/index.js)
- In-memory room management with `rooms` Map and `waitingPool` array
- First player to join room is X, second is O
- Server validates all moves and broadcasts state changes
- Auto-match pairs players from `waitingPool` when 2 are waiting
- Disconnect removes player from pool and deletes room

### Socket Events
| Client → Server | Server → Client |
|-----------------|-----------------|
| `create-room` | `room-created` |
| `join-room` | `room-joined` |
| `auto-match` | `matched` |
| `make-move` | `move-made` |
| | `game-over` |
| | `player-joined` |
| | `opponent-disconnected` |

### Game Types
- **classic** - Standard 3x3
- **ultimate** - 9 mini-boards, move determines opponent's next board
- **3d** - 3x3x3 cube (27 cells)
- **wild** - Random blocked/wild cells each game
- **misere** - Player who gets 3 in a row LOSES
- **tictactwo** - Center cells rotate after moves
- **infinite** - Board expands dynamically

### Play Mode Availability
| Mode | Available Types |
|------|----------------|
| local | All 7 |
| bot | classic, misere |
| online | classic, ultimate, misere |

## Key Files

- `server/game.js` - Win detection constants (CLASSIC_WINS, TD3_WINS), `checkWinner()`, `createRoom()`
- `client/src/utils/minimax.js` - Unbeatable AI using Minimax with alpha-beta pruning
- `client/src/components/Room.jsx` - Game logic hub; `handleMove()` contains local/bot/online branching

## Notes

- The server variable `3D_WINS` is renamed to `TD3_WINS` due to JS identifier restrictions — win detection for 3D mode uses this.
- Bot AI runs client-side; server does not track bot game state.
- Room codes are 4-character uppercase strings generated via `Math.random().toString(36)`.