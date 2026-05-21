import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createRoom, checkWinner, CLASSIC_WINS } from './game.js';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = new Map();
const waitingPool = [];

io.on('connection', (socket) => {
  socket.on('create-room', ({ username, gameType }) => {
    const room = createRoom();
    room.players.push({ id: socket.id, username, symbol: 'X' });
    room.gameType = gameType;
    rooms.set(room.code, room);
    socket.join(room.code);
    socket.emit('room-created', { roomCode: room.code });
  });

  socket.on('join-room', ({ roomCode, username }) => {
    const room = rooms.get(roomCode?.toUpperCase());
    if (!room) return socket.emit('error', { message: 'Room not found' });
    if (room.players.length >= 2) return socket.emit('error', { message: 'Room full' });
    if (room.status === 'finished') return socket.emit('error', { message: 'Game already ended' });

    room.players.push({ id: socket.id, username, symbol: 'O' });
    room.status = 'playing';
    socket.join(room.code);
    socket.to(room.code).emit('player-joined', { player: username });
    socket.emit('room-joined', { roomCode: room.code });
  });

  socket.on('auto-match', ({ username, gameType }) => {
    waitingPool.push({ socket, username, gameType });
    socket.data.username = username;
    socket.data.gameType = gameType;
    if (waitingPool.length >= 2) {
      const p1 = waitingPool.shift();
      const p2 = waitingPool.shift();
      const room = createRoom();
      room.gameType = gameType;
      room.players = [
        { id: p1.socket.id, username: p1.username, symbol: 'X' },
        { id: p2.socket.id, username: p2.username, symbol: 'O' }
      ];
      room.status = 'playing';
      rooms.set(room.code, room);
      p1.socket.join(room.code);
      p2.socket.join(room.code);
      p1.socket.emit('matched', { roomCode: room.code, opponent: p2.username });
      p2.socket.emit('matched', { roomCode: room.code, opponent: p1.username });
      io.to(room.code).emit('game-start');
    }
  });

  socket.on('make-move', ({ cellIndex }) => {
    const roomsArray = [...rooms.entries()];
    const roomEntry = roomsArray.find(([, r]) => r.players.some(p => p.id === socket.id));
    if (!roomEntry) return socket.emit('error', { message: 'Not in a room' });

    const [, room] = roomEntry;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return socket.emit('error', { message: 'Not a player' });
    if (room.board[cellIndex] !== null) return socket.emit('error', { message: 'Cell taken' });
    if (room.currentTurn !== player.symbol) return socket.emit('error', { message: 'Not your turn' });

    room.board[cellIndex] = player.symbol;
    room.currentTurn = player.symbol === 'X' ? 'O' : 'X';

    const result = checkWinner(room.board);
    io.to(room.code).emit('move-made', { cellIndex, board: room.board, currentTurn: room.currentTurn });

    if (result) {
      room.status = 'finished';
      io.to(room.code).emit('game-over', { winner: result.winner, line: result.line });
    }
  });

  socket.on('disconnect', () => {
    // Remove from waiting pool
    const poolIdx = waitingPool.findIndex(p => p.socket.id === socket.id);
    if (poolIdx !== -1) waitingPool.splice(poolIdx, 1);

    // Handle room disconnect
    const roomEntry = [...rooms.entries()].find(([, r]) => r.players.some(p => p.id === socket.id));
    if (roomEntry) {
      const [code, room] = roomEntry;
      io.to(code).emit('opponent-disconnected');
      rooms.delete(code);
    }
  });
});

server.listen(3001, () => console.log('Server running on port 3001'));
