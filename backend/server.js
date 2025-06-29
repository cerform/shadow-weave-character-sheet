
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Настройка CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

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
    try {
      const roomCode = generateRoomCode();
      rooms[roomCode] = {
        players: [{ id: socket.id, nickname, connected: true }],
        createdAt: new Date().toISOString()
      };
      socket.join(roomCode);
      console.log(`🎯 Комната создана: ${roomCode} для ${nickname}`);
      
      if (callback) {
        callback({ roomCode });
      }
      
      io.to(roomCode).emit('updatePlayers', rooms[roomCode].players);
    } catch (error) {
      console.error('Ошибка при создании комнаты:', error);
      if (callback) {
        callback({ error: 'Не удалось создать комнату' });
      }
    }
  });

  socket.on('joinRoom', ({ roomCode, nickname }, callback) => {
    try {
      const room = rooms[roomCode];
      if (room) {
        // Проверяем, не присоединен ли уже игрок
        const existingPlayer = room.players.find(p => p.nickname === nickname);
        if (existingPlayer) {
          existingPlayer.id = socket.id;
          existingPlayer.connected = true;
        } else {
          room.players.push({ id: socket.id, nickname, connected: true });
        }
        
        socket.join(roomCode);
        console.log(`👥 ${nickname} присоединился к комнате ${roomCode}`);
        
        if (callback) {
          callback({ success: true });
        }
        
        io.to(roomCode).emit('updatePlayers', room.players);
      } else {
        console.log(`❌ Комната ${roomCode} не найдена`);
        if (callback) {
          callback({ success: false, message: "Комната не найдена" });
        }
      }
    } catch (error) {
      console.error('Ошибка при присоединении к комнате:', error);
      if (callback) {
        callback({ success: false, message: "Ошибка сервера" });
      }
    }
  });

  socket.on('chatMessage', ({ roomCode, nickname, message }) => {
    try {
      console.log(`💬 Сообщение в ${roomCode} от ${nickname}: ${message}`);
      io.to(roomCode).emit('chatMessage', { nickname, message, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
    }
  });

  socket.on('rollDice', ({ roomCode, nickname, diceType }) => {
    try {
      const diceSides = parseInt(diceType.replace('d', ''), 10);
      const result = Math.floor(Math.random() * diceSides) + 1;
      console.log(`🎲 ${nickname} бросил ${diceType}: ${result}`);
      io.to(roomCode).emit('diceResult', { nickname, diceType, result, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Ошибка при броске кубика:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Игрок отключился:', socket.id);
    
    // Обновляем статус игрока во всех комнатах
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.connected = false;
        console.log(`👤 ${player.nickname} отключился от комнаты ${roomCode}`);
        io.to(roomCode).emit('updatePlayers', room.players);
        
        // Удаляем пустые комнаты через 5 минут
        setTimeout(() => {
          const connectedPlayers = room.players.filter(p => p.connected);
          if (connectedPlayers.length === 0) {
            console.log(`🗑️ Удаление пустой комнаты ${roomCode}`);
            delete rooms[roomCode];
          }
        }, 5 * 60 * 1000);
      }
    }
  });

  // Ping для поддержания соединения
  const pingInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('ping');
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);

  socket.on('pong', () => {
    console.log('🏓 Pong получен от', socket.id);
  });
});

// Обработка ошибок сервера
server.on('error', (error) => {
  console.error('Ошибка сервера:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Получен SIGTERM, завершаем сервер...');
  server.close(() => {
    console.log('Сервер завершен');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌐 WebSocket сервер готов к подключениям`);
});
