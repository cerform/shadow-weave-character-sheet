
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

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

// Хранилище игровых сессий D&D
const gameSessions = new Map();
const players = new Map(); // socketId -> playerInfo

function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function createGameSession(sessionData) {
  const code = generateSessionCode();
  const session = {
    id: Date.now().toString(),
    code,
    name: sessionData.name,
    dmId: sessionData.dmId,
    dmName: sessionData.dmName,
    players: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    messages: [],
    diceRolls: [],
    battleMap: {
      width: 800,
      height: 600,
      gridSize: 30,
      tokens: [],
      isActive: false
    },
    initiative: {
      order: [],
      currentTurn: 0,
      round: 1
    },
    notes: [],
    handouts: []
  };
  
  gameSessions.set(code, session);
  return session;
}

io.on('connection', (socket) => {
  console.log('✅ Подключение:', socket.id);

  // Создание сессии (DM)
  socket.on('session:create', (data, callback) => {
    try {
      console.log('🎯 Создание сессии:', data);
      
      const session = createGameSession({
        name: data.name,
        dmId: socket.id,
        dmName: data.dmName,
        character: data.character
      });

      // Добавляем DM как игрока
      const dmPlayer = {
        id: socket.id,
        name: data.dmName,
        character: data.character,
        isDM: true,
        isOnline: true,
        joinedAt: new Date().toISOString()
      };
      
      session.players.push(dmPlayer);
      players.set(socket.id, { ...dmPlayer, sessionCode: session.code });
      
      socket.join(session.code);
      
      console.log(`🎮 Сессия "${session.name}" создана с кодом: ${session.code}`);
      
      callback({ 
        success: true, 
        session: session 
      });
      
      // Уведомляем всех в комнате об обновлении
      io.to(session.code).emit('session:updated', session);
      
    } catch (error) {
      console.error('❌ Ошибка создания сессии:', error);
      callback({ 
        success: false, 
        error: 'Не удалось создать сессию' 
      });
    }
  });

  // Присоединение к сессии (Player)
  socket.on('session:join', (data, callback) => {
    try {
      const { code, playerName, character } = data;
      const session = gameSessions.get(code);
      
      if (!session) {
        callback({ 
          success: false, 
          error: 'Сессия не найдена' 
        });
        return;
      }

      // Проверяем, не присоединен ли уже игрок
      const existingPlayer = session.players.find(p => p.name === playerName);
      let player;
      
      if (existingPlayer && !existingPlayer.isOnline) {
        // Переподключение игрока
        existingPlayer.id = socket.id;
        existingPlayer.isOnline = true;
        player = existingPlayer;
      } else if (!existingPlayer) {
        // Новый игрок
        player = {
          id: socket.id,
          name: playerName,
          character: character,
          isDM: false,
          isOnline: true,
          joinedAt: new Date().toISOString()
        };
        session.players.push(player);
      } else {
        callback({ 
          success: false, 
          error: 'Игрок с таким именем уже в сессии' 
        });
        return;
      }

      players.set(socket.id, { ...player, sessionCode: code });
      socket.join(code);
      
      console.log(`👥 ${playerName} присоединился к сессии ${code}`);
      
      callback({ 
        success: true, 
        session: session 
      });
      
      // Уведомляем всех об обновлении игроков
      io.to(code).emit('session:updated', session);
      io.to(code).emit('session:player_joined', player);
      
    } catch (error) {
      console.error('❌ Ошибка присоединения:', error);
      callback({ 
        success: false, 
        error: 'Не удалось присоединиться к сессии' 
      });
    }
  });

  // Отправка сообщения
  socket.on('session:send_message', (data) => {
    try {
      const player = players.get(socket.id);
      if (!player) return;

      const session = gameSessions.get(player.sessionCode);
      if (!session) return;

      const message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        type: data.type || 'chat',
        sender: player.name,
        content: data.content,
        timestamp: new Date().toISOString(),
        sessionId: session.id,
        isDM: player.isDM
      };

      session.messages.push(message);
      
      console.log(`💬 Сообщение в ${player.sessionCode}: ${player.name}: ${data.content}`);
      
      io.to(player.sessionCode).emit('session:message', message);
      
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
    }
  });

  // Бросок кубиков
  socket.on('session:roll_dice', (data) => {
    try {
      const player = players.get(socket.id);
      if (!player) return;

      const session = gameSessions.get(player.sessionCode);
      if (!session) return;

      // Парсим тип кубика (например, "d20", "2d6")
      const diceMatch = data.diceType.match(/(\d*)d(\d+)/);
      if (!diceMatch) return;

      const count = parseInt(diceMatch[1]) || 1;
      const sides = parseInt(diceMatch[2]);
      
      let total = 0;
      const rolls = [];
      
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += roll;
      }
      
      const finalTotal = total + (data.modifier || 0);
      
      const diceResult = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        playerId: socket.id,
        playerName: player.name,
        diceType: data.diceType,
        result: total,
        rolls: rolls,
        modifier: data.modifier || 0,
        total: finalTotal,
        reason: data.reason || '',
        timestamp: new Date().toISOString()
      };

      session.diceRolls.push(diceResult);
      
      console.log(`🎲 ${player.name} бросил ${data.diceType}: ${rolls.join(', ')} = ${total} + ${data.modifier || 0} = ${finalTotal}`);
      
      io.to(player.sessionCode).emit('session:dice_roll', diceResult);
      
    } catch (error) {
      console.error('❌ Ошибка броска кубиков:', error);
    }
  });

  // Обновление персонажа
  socket.on('session:update_character', (data) => {
    try {
      const player = players.get(socket.id);
      if (!player) return;

      const session = gameSessions.get(player.sessionCode);
      if (!session) return;

      // Обновляем персонажа в сессии
      const sessionPlayer = session.players.find(p => p.id === socket.id);
      if (sessionPlayer) {
        sessionPlayer.character = { ...sessionPlayer.character, ...data.character };
        players.set(socket.id, { ...player, character: sessionPlayer.character });
      }
      
      console.log(`🧙 ${player.name} обновил персонажа`);
      
      io.to(player.sessionCode).emit('session:character_updated', {
        playerId: socket.id,
        character: sessionPlayer.character
      });
      
    } catch (error) {
      console.error('❌ Ошибка обновления персонажа:', error);
    }
  });

  // Управление боевой картой
  socket.on('battle:token_add', (data) => {
    try {
      const player = players.get(socket.id);
      if (!player || !player.isDM) return; // Только DM может добавлять токены

      const session = gameSessions.get(player.sessionCode);
      if (!session) return;

      const token = {
        ...data.token,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
      };

      session.battleMap.tokens.push(token);
      
      io.to(player.sessionCode).emit('battle:token_added', token);
      
    } catch (error) {
      console.error('❌ Ошибка добавления токена:', error);
    }
  });

  socket.on('battle:token_move', (data) => {
    try {
      const player = players.get(socket.id);
      if (!player) return;

      const session = gameSessions.get(player.sessionCode);
      if (!session) return;

      const tokenIndex = session.battleMap.tokens.findIndex(t => t.id === data.tokenId);
      if (tokenIndex >= 0) {
        session.battleMap.tokens[tokenIndex].x = data.x;
        session.battleMap.tokens[tokenIndex].y = data.y;
        
        io.to(player.sessionCode).emit('battle:token_moved', {
          tokenId: data.tokenId,
          x: data.x,
          y: data.y
        });
      }
      
    } catch (error) {
      console.error('❌ Ошибка перемещения токена:', error);
    }
  });

  // Управление инициативой
  socket.on('initiative:start', (data) => {
    try {
      const player = players.get(socket.id);
      if (!player || !player.isDM) return;

      const session = gameSessions.get(player.sessionCode);
      if (!session) return;

      session.initiative.order = data.order;
      session.initiative.currentTurn = 0;
      session.initiative.round = 1;
      
      io.to(player.sessionCode).emit('initiative:started', session.initiative);
      
    } catch (error) {
      console.error('❌ Ошибка запуска инициативы:', error);
    }
  });

  // Завершение сессии
  socket.on('session:end', () => {
    try {
      const player = players.get(socket.id);
      if (!player || !player.isDM) return;

      const session = gameSessions.get(player.sessionCode);
      if (!session) return;

      session.isActive = false;
      session.endedAt = new Date().toISOString();
      
      io.to(player.sessionCode).emit('session:ended', { reason: 'DM ended session' });
      
      // Удаляем всех игроков из комнаты
      const roomSockets = io.sockets.adapter.rooms.get(player.sessionCode);
      if (roomSockets) {
        roomSockets.forEach(socketId => {
          const roomSocket = io.sockets.sockets.get(socketId);
          if (roomSocket) {
            roomSocket.leave(player.sessionCode);
          }
        });
      }
      
      console.log(`🔚 Сессия ${player.sessionCode} завершена`);
      
    } catch (error) {
      console.error('❌ Ошибка завершения сессии:', error);
    }
  });

  // Отключение игрока
  socket.on('disconnect', () => {
    try {
      const player = players.get(socket.id);
      if (!player) return;

      const session = gameSessions.get(player.sessionCode);
      if (session) {
        const sessionPlayer = session.players.find(p => p.id === socket.id);
        if (sessionPlayer) {
          sessionPlayer.isOnline = false;
          
          console.log(`❌ ${player.name} отключился от сессии ${player.sessionCode}`);
          
          io.to(player.sessionCode).emit('session:player_disconnected', {
            playerId: socket.id,
            playerName: player.name
          });
        }
      }
      
      players.delete(socket.id);
      
    } catch (error) {
      console.error('❌ Ошибка отключения:', error);
    }
  });

  // Ping-pong для поддержания соединения
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Очистка неактивных сессий каждые 30 минут
setInterval(() => {
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  for (const [code, session] of gameSessions.entries()) {
    const lastActivity = new Date(session.createdAt).getTime();
    const onlinePlayers = session.players.filter(p => p.isOnline).length;
    
    if (now - lastActivity > thirtyMinutes && onlinePlayers === 0) {
      console.log(`🗑️ Удаление неактивной сессии: ${code}`);
      gameSessions.delete(code);
    }
  }
}, 30 * 60 * 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 D&D Server запущен на порту ${PORT}`);
  console.log(`🎮 Готов к игровым сессиям!`);
});
