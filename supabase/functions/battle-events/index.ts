// Edge function для обработки событий боевой карты
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BattleEventData {
  sessionId: string;
  eventType: 'combat_start' | 'initiative_roll' | 'token_spawn' | 'fog_reveal';
  eventData: any;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { sessionId, eventType, eventData, userId } = await req.json() as BattleEventData;

    console.log(`🎮 Battle event: ${eventType} for session ${sessionId} by user ${userId}`);

    // Проверяем права доступа к сессии
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('id, dm_id')
      .eq('session_code', sessionId)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Проверяем, является ли пользователь участником сессии
    const { data: participant } = await supabase
      .from('session_players')
      .select('id, user_id')
      .eq('session_id', session.id)
      .eq('user_id', userId)
      .single();

    const isDM = session.dm_id === userId;
    const isParticipant = !!participant;

    if (!isDM && !isParticipant) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Обрабатываем событие в зависимости от типа
    let result = {};

    switch (eventType) {
      case 'combat_start':
        // Логика начала боя
        result = await handleCombatStart(supabase, session.id, eventData, userId);
        break;

      case 'initiative_roll':
        // Логика броска инициативы
        result = await handleInitiativeRoll(supabase, session.id, eventData, userId);
        break;

      case 'token_spawn':
        // Логика спавна токенов (только для ДМ)
        if (!isDM) {
          return new Response(
            JSON.stringify({ error: 'Only DM can spawn tokens' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await handleTokenSpawn(supabase, session.id, eventData, userId);
        break;

      case 'fog_reveal':
        // Логика открытия тумана (только для ДМ)
        if (!isDM) {
          return new Response(
            JSON.stringify({ error: 'Only DM can modify fog of war' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await handleFogReveal(supabase, session.id, eventData, userId);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown event type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Отправляем результат
    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Battle event error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Обработчики событий

async function handleCombatStart(supabase: any, sessionId: string, eventData: any, userId: string) {
  console.log('⚔️ Starting combat for session:', sessionId);
  
  // Можно сохранить состояние боя в базу данных
  const { data, error } = await supabase
    .from('combat_states')
    .insert({
      session_id: sessionId,
      state: 'active',
      initiative_order: eventData.initiativeOrder || [],
      current_turn: 0,
      round: 1,
      created_by: userId
    });

  if (error) {
    console.error('Error saving combat state:', error);
    throw error;
  }

  return { combatId: data?.[0]?.id, message: 'Combat started successfully' };
}

async function handleInitiativeRoll(supabase: any, sessionId: string, eventData: any, userId: string) {
  console.log('🎲 Initiative roll:', eventData);
  
  // Сохраняем результат инициативы
  const { data, error } = await supabase
    .from('initiative_rolls')
    .insert({
      session_id: sessionId,
      user_id: userId,
      character_name: eventData.characterName,
      roll_result: eventData.rollResult,
      modifier: eventData.modifier || 0,
      total: eventData.rollResult + (eventData.modifier || 0)
    });

  if (error) {
    console.error('Error saving initiative:', error);
    throw error;
  }

  return { message: 'Initiative roll saved' };
}

async function handleTokenSpawn(supabase: any, sessionId: string, eventData: any, userId: string) {
  console.log('👹 Token spawn:', eventData);
  
  // Сохраняем информацию о спавне токена
  const { data, error } = await supabase
    .from('battle_tokens')
    .insert({
      session_id: sessionId,
      token_type: eventData.tokenType,
      name: eventData.name,
      position_x: eventData.position.x,
      position_y: eventData.position.y,
      hp: eventData.hp,
      max_hp: eventData.maxHp,
      ac: eventData.ac,
      is_enemy: eventData.isEnemy || false,
      created_by: userId
    });

  if (error) {
    console.error('Error saving token:', error);
    throw error;
  }

  return { tokenId: data?.[0]?.id, message: 'Token spawned successfully' };
}

async function handleFogReveal(supabase: any, sessionId: string, eventData: any, userId: string) {
  console.log('🌫️ Fog reveal:', eventData);
  
  // Сохраняем изменения тумана войны
  const { data, error } = await supabase
    .from('fog_states')
    .upsert({
      session_id: sessionId,
      fog_data: eventData.fogData,
      updated_by: userId,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving fog state:', error);
    throw error;
  }

  return { message: 'Fog of war updated' };
}