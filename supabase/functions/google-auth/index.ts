import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code } = await req.json()
    console.log('🔄 Получен код от Google:', code ? 'есть' : 'нет')

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Код авторизации не предоставлен' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Получаем Google Client ID и Secret из окружения
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    
    if (!googleClientId || !googleClientSecret) {
      console.error('❌ Google credentials не настроены')
      return new Response(
        JSON.stringify({ error: 'Google credentials не настроены' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔄 Обмениваем код на токены Google')

    // Обмениваем код на токены
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        grant_type: 'authorization_code',
        redirect_uri: 'postmessage', // Для popup flow
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('❌ Ошибка обмена токенов:', tokenData)
      return new Response(
        JSON.stringify({ error: 'Ошибка получения токенов от Google' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Получили токены от Google')

    // Получаем информацию о пользователе
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      console.error('❌ Ошибка получения данных пользователя:', userData)
      return new Response(
        JSON.stringify({ error: 'Ошибка получения данных пользователя' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Получили данные пользователя от Google:', userData.email)

    // Создаем Supabase клиент
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Используем signInWithOAuth для создания или входа пользователя
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'postmessage',
        queryParams: {
          code,
          access_token: tokenData.access_token,
        }
      }
    })

    if (error) {
      console.error('❌ Ошибка Supabase OAuth:', error)
      return new Response(
        JSON.stringify({ error: 'Ошибка создания сессии Supabase' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Успешно создана сессия Supabase')

    return new Response(
      JSON.stringify({ 
        success: true,
        user: userData,
        message: 'Авторизация успешна'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error)
    return new Response(
      JSON.stringify({ error: 'Произошла неожиданная ошибка' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})