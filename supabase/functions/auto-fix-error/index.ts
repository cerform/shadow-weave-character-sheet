import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { errorLogId } = await req.json();
    
    if (!errorLogId) {
      throw new Error('errorLogId is required');
    }

    console.log('🔧 Автоматическое исправление ошибки:', errorLogId);

    // Инициализируем Supabase клиент
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Получаем информацию об ошибке
    const { data: errorLog, error: fetchError } = await supabase
      .from('error_logs')
      .select('*')
      .eq('id', errorLogId)
      .single();

    if (fetchError || !errorLog) {
      throw new Error('Error log not found');
    }

    console.log('📋 Ошибка найдена:', errorLog.message);

    // Получаем AI-анализ
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY не настроен');
    }

    const systemPrompt = `Ты - эксперт по исправлению ошибок в веб-приложениях на React/TypeScript.
Твоя задача - предоставить КОНКРЕТНОЕ пошаговое решение для исправления ошибки.

Формат ответа должен быть строго JSON:
{
  "canAutoFix": true/false,
  "fixSteps": ["шаг 1", "шаг 2", ...],
  "codeChanges": [
    {
      "file": "путь/к/файлу.tsx",
      "description": "Описание изменения",
      "suggestion": "Конкретный код или изменение"
    }
  ],
  "prevention": "Как предотвратить такую ошибку в будущем"
}

Если ошибку можно исправить автоматически (canAutoFix: true), предоставь детальные инструкции.`;

    const userPrompt = `Проанализируй и предложи исправление для следующей ошибки:

**Сообщение ошибки:**
${errorLog.message}

**Категория:** ${errorLog.category}
**Серьезность:** ${errorLog.severity}

${errorLog.stack_trace ? `**Stack Trace:**
${errorLog.stack_trace}` : ''}

${errorLog.url ? `**URL:** ${errorLog.url}` : ''}

${errorLog.metadata ? `**Дополнительная информация:**
${JSON.stringify(errorLog.metadata, null, 2)}` : ''}

Предоставь конкретное решение в формате JSON.`;

    console.log('🤖 Отправка запроса к AI для автоисправления...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Ошибка AI API:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Превышен лимит запросов к AI. Попробуйте позже.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Недостаточно средств для AI. Пополните баланс.');
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const fixSuggestion = aiData.choices[0].message.content;

    console.log('✅ AI предложение получено');

    // Парсим JSON ответ
    let parsedFix;
    try {
      // Пытаемся извлечь JSON из markdown блока, если есть
      const jsonMatch = fixSuggestion.match(/```json\n([\s\S]*?)\n```/) || 
                        fixSuggestion.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : fixSuggestion;
      parsedFix = JSON.parse(jsonText);
    } catch (e) {
      console.warn('⚠️ Не удалось распарсить JSON, используем текстовый ответ');
      parsedFix = {
        canAutoFix: false,
        fixSteps: [fixSuggestion],
        codeChanges: [],
        prevention: 'См. детали выше'
      };
    }

    // Сохраняем предложение по исправлению в метаданные ошибки
    const { error: updateError } = await supabase
      .from('error_logs')
      .update({
        metadata: {
          ...errorLog.metadata,
          autoFixSuggestion: parsedFix,
          autoFixAttemptedAt: new Date().toISOString()
        }
      })
      .eq('id', errorLogId);

    if (updateError) {
      console.error('❌ Ошибка обновления лога:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        fix: parsedFix,
        message: 'Предложение по исправлению сгенерировано'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Ошибка в auto-fix-error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
