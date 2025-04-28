const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {}; // Хранилище комнат

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

io.on('connection', (socket) => {
  console.log('✅ Игрок подключился:', socket.id);

  socket.on('createRoom', (nickname, callback) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      players: [{ id: socket.id, nickname }]
    };
    socket.join(roomCode);
    console.log(`🎯 Комната создана: ${roomCode}`);
    callback({ roomCode });
    io.to(roomCode).emit('updatePlayers', rooms[roomCode].players);
  });

  socket.on('joinRoom', ({ roomCode, nickname }, callback) => {
    const room = rooms[roomCode];
    if (room) {
      rooms[roomCode].players.push({ id: socket.id, nickname });
      socket.join(roomCode);
      callback({ success: true });
      io.to(roomCode).emit('updatePlayers', rooms[roomCode].players);
    } else {
      callback({ success: false, message: "Комната не найдена" });
    }
  });

  socket.on('chatMessage', ({ roomCode, nickname, message }) => {
    io.to(roomCode).emit('chatMessage', { nickname, message });
  });

  socket.on('rollDice', ({ roomCode, nickname, diceType }) => {
    const diceSides = parseInt(diceType.replace('d', ''), 10);
    const result = Math.floor(Math.random() * diceSides) + 1;
    io.to(roomCode).emit('diceResult', { nickname, diceType, result });
  });

  socket.on('disconnect', () => {
    console.log('❌ Игрок отключился:', socket.id);
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      room.players = room.players.filter(player => player.id !== socket.id);
      io.to(roomCode).emit('updatePlayers', room.players);
      if (room.players.length === 0) {
        delete rooms[roomCode];
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
