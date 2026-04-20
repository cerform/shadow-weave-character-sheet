require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { nanoid } = require('nanoid');
const aiManager = require('./services/aiManager');

const app = express();
const server = http.createServer(app);

// Инициализация Supabase (используем service_role для обхода RLS в бэкенде)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

// Хелперы для работы с БД
async function getSessionByCode(code) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*, session_players(*)')
    .eq('code', code)
    .single();
  
  if (error) return null;
  return data;
}

io.on('connection', (socket) => {
  console.log('✅ Подключение:', socket.id);

  // Создание сессии (DM)
  socket.on('session:create', async (data, callback) => {
    try {
      console.log('🎯 Создание сессии в БД:', data);
      
      const code = nanoid(6).toUpperCase();
      
      // 1. Создаем сессию
      const dmType = data.dmType || 'human'; // 'human' | 'ai'
      aiManager.setDMType(dmType);

      const { data: session, error: sError } = await supabase
        .from('game_sessions')
        .insert([{
          code,
          name: data.name,
          description: data.description || null,
          dm_id: data.userId || null,
          is_active: true,
          is_ai_dm: dmType === 'ai',
        }])
        .select()
        .single();

      if (sError) throw sError;

      // 2. DM as player
      const { data: player, error: pError } = await supabase
        .from('session_players')
        .insert([{
          session_id: session.id,
          user_id: data.userId || null,
          socket_id: socket.id,
          player_name: data.dmName,
          is_dm: true,
          is_online: true
        }])
        .select()
        .single();

      if (pError) throw pError;

      socket.join(code);
      socket.data.sessionCode = code;
      socket.data.sessionId = session.id;
      socket.data.userId = data.userId;
      socket.data.playerName = data.dmName;
      socket.data.isDM = true;

      console.log(`🎮 Session "${session.name}" created. Code: ${code}. DM type: ${dmType}`);

      // If AI DM and party provided, generate campaign
      if (dmType === 'ai' && data.party && data.party.length > 0) {
        const campaign = await aiManager.generateCampaign(data.party);
        if (campaign) {
          socket.emit('ai:campaign_generated', campaign);
          // Auto-generate starting map
          const mapPrompt = await aiManager.generateMapPrompt(campaign.location);
          socket.emit('session:message', {
            id: nanoid(),
            sender_name: 'AI Dungeon Master',
            content: `Кампания создана: «${campaign.title}». Генерирую карту...`,
            type: 'system',
            created_at: new Date().toISOString()
          });
          const imageUrl = await aiManager.generateImage(mapPrompt, 'map');
          if (imageUrl) {
            io.to(code).emit('session:map_generated', { imageUrl });
          }
        }
      }
      
      callback({ success: true, session: { ...session, players: [player] } });
      
    } catch (error) {
      console.error('\u274c Session create error:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Присоединение к сессии
  socket.on('session:join', async (data, callback) => {
    try {
      const { code, playerName, userId, character } = data;
      const session = await getSessionByCode(code);
      
      if (!session) {
        return callback({ success: false, error: 'Сессия не найдена' });
      }

      // Проверяем, есть ли уже такой игрок (по userId или имени)
      const { data: existingPlayer } = await supabase
        .from('session_players')
        .select()
        .eq('session_id', session.id)
        .or(`player_name.eq."${playerName}",user_id.eq."${userId || 'null'}"`)
        .maybeSingle();

      let player;
      if (existingPlayer) {
        // Обновляем статус онлайн
        const { data: updatedPlayer } = await supabase
          .from('session_players')
          .update({ is_online: true, socket_id: socket.id, character_data: character || existingPlayer.character_data })
          .eq('id', existingPlayer.id)
          .select()
          .single();
        player = updatedPlayer;
      } else {
        // Создаем нового игрока
        const { data: newPlayer } = await supabase
          .from('session_players')
          .insert([{
            session_id: session.id,
            user_id: userId || null,
            socket_id: socket.id,
            player_name: playerName,
            character_data: character || {},
            is_dm: false,
            is_online: true
          }])
          .select()
          .single();
        player = newPlayer;
      }

      socket.join(code);
      socket.data.sessionCode = code;
      socket.data.playerName = playerName;
      socket.data.isDM = player.is_dm;

      console.log(`👥 ${playerName} вошел в сессию ${code}`);
      
      const fullSession = await getSessionByCode(code);
      callback({ success: true, session: fullSession });
      
      io.to(code).emit('session:updated', fullSession);
      io.to(code).emit('session:player_joined', player);
      
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Чат и история сообщений
  socket.on('session:send_message', async (data) => {
    try {
      const { sessionCode, playerName, isDM } = socket.data;
      if (!sessionCode) return;

      const session = await getSessionByCode(sessionCode);
      if (!session) return;

      const { data: message, error } = await supabase
        .from('session_messages')
        .insert([{
          session_id: session.id,
          sender_name: playerName,
          content: data.content,
          type: data.type || 'chat',
          is_dm: isDM
        }])
        .select()
        .single();

      if (error) throw error;
      
      io.to(sessionCode).emit('session:message', message);
      
      // AI DM reaction
      const aiComment = await aiManager.generateCommentary({
        type: 'chat',
        playerName: playerName,
        content: data.content
      });
      
      if (aiComment) {
        io.to(sessionCode).emit('session:message', {
          id: nanoid(),
          sender_name: 'AI Dungeon Master',
          content: aiComment,
          type: 'text',
          created_at: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Ошибка чата:', error);
    }
  });

  // Бросок кубиков (теперь просто логируем в БД как сообщение типа dice)
  socket.on('session:roll_dice', async (data) => {
    try {
      const { sessionCode, playerName } = socket.data;
      if (!sessionCode) return;

      // Логика броска (выносим на сервер для честности)
      const diceMatch = data.diceType.match(/(\d*)d(\d+)/);
      const count = diceMatch ? (parseInt(diceMatch[1]) || 1) : 1;
      const sides = diceMatch ? parseInt(diceMatch[2]) : 20;
      
      let total = 0;
      const rolls = [];
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += roll;
      }
      
      const result = {
        playerName,
        diceType: data.diceType,
        total: total + (data.modifier || 0),
        rolls,
        reason: data.reason
      };

      // Сохраняем бросок как особое сообщение
      await supabase.from('session_messages').insert([{
        session_id: (await getSessionByCode(sessionCode)).id,
        sender_name: playerName,
        content: JSON.stringify(result),
        type: 'dice'
      }]);

      io.to(sessionCode).emit('session:dice_roll', result);
      
      // AI DM reaction
      const aiComment = await aiManager.generateCommentary({
        type: 'dice_roll',
        playerName: playerName,
        diceType: data.diceType,
        total: result.total
      });
      
      if (aiComment) {
        io.to(sessionCode).emit('session:message', {
          id: nanoid(),
          sender_name: 'AI Dungeon Master',
          content: aiComment,
          type: 'text',
          created_at: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Ошибка броска:', error);
    }
  });

    // AI Customization
    socket.on('ai:set_personality', (type) => {
      if (!socket.data.isDM) return;
      aiManager.setPersonality(type);
      
      const flavorNames = { 
        epic: 'Эпический Сказитель', 
        merciless: 'Беспощадный Судья', 
        rules: 'Хранитель Правил', 
        dark: 'Мрачная Тень' 
      };

      io.to(socket.data.sessionCode).emit('session:message', {
        id: nanoid(),
        sender_name: 'System',
        content: `ИИ Мастер теперь: ${flavorNames[type] || type}`,
        type: 'text',
        created_at: new Date().toISOString()
      });
    });

    socket.on('ai:set_model', (type) => {
      if (!socket.data.isDM) return;
      aiManager.setModelType(type);
      io.to(socket.data.sessionCode).emit('session:message', {
        id: nanoid(),
        sender_name: 'System',
        content: `ИИ переведен на модель: ${type === 'groq' ? 'Llama 3.1 (Высокая скорость)' : 'GPT-4o (Стандарт)'}`,
        type: 'text',
        created_at: new Date().toISOString()
      });
    });

    socket.on('ai:generate_map', async (data) => {
      if (!socket.data.isDM) return;
      const imageUrl = await aiManager.generateImage(data.prompt, 'map');
      if (imageUrl) {
        // Сохраняем в БД для персистентности
        await supabase
          .from('game_sessions')
          .update({ current_map_url: imageUrl })
          .eq('id', socket.data.sessionCode);

        await supabase
          .from('battle_maps')
          .upsert({
            session_id: socket.data.sessionCode,
            name: `AI: ${data.prompt}`,
            file_url: imageUrl,
            is_active: true
          }, { onConflict: 'session_id' });

        io.to(socket.data.sessionCode).emit('session:map_generated', { imageUrl });
      }
    });

    socket.on('ai:generate_token', async (data) => {
      if (!socket.data.isDM) return;
      const imageUrl = await aiManager.generateImage(data.prompt, 'token');
      if (imageUrl) {
        socket.emit('ai:token_generated', { imageUrl });
      }
    });

    // AI NPC Speaks with voice
    socket.on('ai:npc_speak', async (data) => {
      const { npcName, situation } = data;
      const sessionCode = socket.data.sessionCode;
      if (!sessionCode) return;

      // Get party context
      const session = await getSessionByCode(sessionCode);
      const players = session?.session_players?.map(p => p.player_name).join(', ') || '';

      const result = await aiManager.generateNPCSpeech(npcName, situation, players);
      if (!result) return;

      // Broadcast text to all
      io.to(sessionCode).emit('session:message', {
        id: nanoid(),
        sender_name: npcName,
        content: result.text,
        type: 'npc',
        npc_voice_role: result.voiceRole,
        created_at: new Date().toISOString()
      });

      // Synthesize and send audio if ElevenLabs is configured
      const audioBase64 = await aiManager.synthesizeSpeech(result.text, result.voiceId);
      if (audioBase64) {
        io.to(sessionCode).emit('ai:npc_audio', {
          npcName,
          voiceRole: result.voiceRole,
          audioData: audioBase64
        });
      }
    });

    // AI campaign generation from party
    socket.on('ai:generate_campaign', async (data) => {
      if (!socket.data.isDM) return;
      const { party } = data;
      const campaign = await aiManager.generateCampaign(party);
      if (campaign) {
        io.to(socket.data.sessionCode).emit('ai:campaign_generated', campaign);
        socket.emit('session:message', {
          id: nanoid(),
          sender_name: 'AI Dungeon Master',
          content: `\u041aампания: \u00ab${campaign.title}\u00bb. ${campaign.hook}`,
          type: 'system',
          created_at: new Date().toISOString()
        });
      }
    });

    // DM type change
    socket.on('ai:set_dm_type', (type) => {
      if (!socket.data.isDM) return;
      aiManager.setDMType(type);
      io.to(socket.data.sessionCode).emit('session:message', {
        id: nanoid(),
        sender_name: 'System',
        content: type === 'ai' ? '\u0418И взял управление кампанией' : 'Человек-Мастер взял бразды',
        type: 'system',
        created_at: new Date().toISOString()
      });
    });

    // --- Battle Map & Tokens ---
  
  // Добавление токена
  socket.on('battle:token_add', async (data) => {
    try {
      const { sessionCode, isDM } = socket.data;
      if (!sessionCode || !isDM) return;

      const session = await getSessionByCode(sessionCode);
      if (!session) return;

      const { data: token, error } = await supabase
        .from('battle_tokens')
        .insert([{
          session_id: session.id,
          name: data.name,
          position_x: data.x,
          position_y: data.y,
          current_hp: data.current_hp,
          max_hp: data.max_hp,
          image_url: data.image_url,
          character_id: data.character_id
        }])
        .select()
        .single();

      if (error) throw error;
      io.to(sessionCode).emit('battle:token_added', token);
    } catch (error) {
      console.error('❌ Ошибка добавления токена:', error);
    }
  });

  // Перемещение токена
  socket.on('battle:token_move', async (data) => {
    try {
      const { sessionCode } = socket.data;
      if (!sessionCode) return;

      // Обновляем в БД
      const { data: token, error } = await supabase
        .from('battle_tokens')
        .update({ position_x: data.x, position_y: data.y })
        .eq('id', data.tokenId)
        .select()
        .single();

      if (error) throw error;
      
      // Рассылаем всем кроме отправителя (для плавности на клиенте)
      socket.to(sessionCode).emit('battle:token_moved', {
        tokenId: data.tokenId,
        x: data.x,
        y: data.y
      });

      // AI DM Reaction (10% chance for movement)
      if (Math.random() < 0.1) {
        const aiComment = await aiManager.generateCommentary({
          type: 'token_move',
          tokenName: 'Something', // Ideally we'd fetch the name
          x: data.x,
          y: data.y
        });
        
        if (aiComment) {
          io.to(sessionCode).emit('session:message', {
            id: nanoid(),
            sender_name: 'AI Dungeon Master',
            content: aiComment,
            type: 'text',
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('❌ Ошибка перемещения токена:', error);
    }
  });

  // Удаление токена
  socket.on('battle:token_delete', async (tokenId) => {
    try {
      const { sessionCode, isDM } = socket.data;
      if (!sessionCode || !isDM) return;

      await supabase.from('battle_tokens').delete().eq('id', tokenId);
      io.to(sessionCode).emit('battle:token_deleted', tokenId);
    } catch (error) {
      console.error('❌ Ошибка удаления токена:', error);
    }
  });

  socket.on('disconnect', async () => {
    try {
      const { sessionCode, playerName } = socket.data;
      if (sessionCode) {
        await supabase
          .from('session_players')
          .update({ is_online: false })
          .eq('socket_id', socket.id);
        
        io.to(sessionCode).emit('session:player_disconnected', { playerName });
      }
    } catch (error) {
      console.error('❌ Ошибка дисконнекта:', error);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Production-ready SSR Server запущен на порту ${PORT}`);
});
