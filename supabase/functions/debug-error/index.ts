import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { errorLog } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY не настроен");
    }

    // Формируем контекст для AI
    const systemPrompt = `Ты опытный разработчик, специализирующийся на отладке React/TypeScript приложений с Supabase.
Проанализируй ошибку и предоставь:
1. Краткое объяснение причины ошибки (2-3 предложения)
2. Конкретные шаги для исправления (пронумерованный список)
3. Код-пример исправления, если применимо
4. Предложения по предотвращению подобных ошибок

Отвечай на русском языке. Будь конкретным и практичным.`;

    const userPrompt = `Категория: ${errorLog.category}
Серьезность: ${errorLog.severity}
Сообщение: ${errorLog.message}
${errorLog.stack_trace ? `\nStack Trace:\n${errorLog.stack_trace}` : ''}
${errorLog.url ? `\nURL: ${errorLog.url}` : ''}
${errorLog.metadata ? `\nМетаданные: ${JSON.stringify(errorLog.metadata, null, 2)}` : ''}`;

    console.log('🤖 Отправка запроса к AI для анализа ошибки...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Превышен лимит запросов. Попробуйте позже." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Требуется пополнение кредитов Lovable AI." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error('❌ Ошибка AI Gateway:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || 'Не удалось получить анализ';

    console.log('✅ AI анализ получен');

    return new Response(
      JSON.stringify({ analysis }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('❌ Ошибка в debug-error function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Неизвестная ошибка" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
