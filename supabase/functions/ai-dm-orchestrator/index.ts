// ============================================================
// ai-dm-orchestrator — Supabase Edge Function
// Processes a player action and generates a DM narration response
// Model: Claude 3.5 Sonnet
// ============================================================

import Anthropic from "npm:@anthropic-ai/sdk@0.32.1";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface PlayerAction {
  sessionId: string;
  playerId: string;
  characterName: string;
  actionType: "speech" | "movement" | "attack" | "skill" | "item" | "free";
  content: string;
  diceResult?: { type: string; value: number };
}

interface CampaignContext {
  campaign_name: string;
  ai_personality: string;
  world_facts: Record<string, unknown>;
  short_summary: string;
  active_quests: unknown[];
  npc_registry: Record<string, unknown>;
  party_info: unknown[];
  turn_count: number;
}

const PERSONALITY_INSTRUCTIONS: Record<string, string> = {
  epic: "Ты — эпический рассказчик. Высокое фэнтези, героизм, грандиозные описания. Мир полон чудес и опасностей.",
  dark: "Ты — мрачный повествователь. Тёмное фэнтези, моральные дилеммы, атмосфера ужаса. Каждое решение имеет цену.",
  merciless:
    "Ты — беспощадный мастер. Мир смертельно опасен, ошибки фатальны, ресурсы ограничены. Не щади игроков.",
  rules:
    "Ты — точный мастер правил. Строго следуешь D&D 5e SRD. Указывай DC, модификаторы, точные механики.",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { action, context } = (await req.json()) as {
      action: PlayerAction;
      context: CampaignContext;
    };

    const personality =
      PERSONALITY_INSTRUCTIONS[context.ai_personality] ??
      PERSONALITY_INSTRUCTIONS.epic;

    const system = `Ты — AI Dungeon Master для D&D 5e кампании "${context.campaign_name}".
${personality}

КОНТЕКСТ МИРА:
${JSON.stringify(context.world_facts, null, 1)}

КРАТКОЕ РЕЗЮМЕ СОБЫТИЙ:
${context.short_summary || "Начало кампании."}

АКТИВНЫЕ КВЕСТЫ:
${JSON.stringify(context.active_quests || [], null, 1)}

ИЗВЕСТНЫЕ NPC:
${JSON.stringify(context.npc_registry || {}, null, 1)}

ПАРТИЯ:
${JSON.stringify(context.party_info || [], null, 1)}

ХОД: ${(context.turn_count ?? 0) + 1}

ПРАВИЛА ОТВЕТА:
1. Отвечай ТОЛЬКО валидным JSON по схеме ниже
2. Описание (narration) — 2-4 атмосферных предложения на РУССКОМ
3. Реагируй на действие игрока логично и последовательно
4. Если действие требует броска, укажи это в nextActions
5. Учитывай предыдущие события из резюме`;

    const userPrompt = `Действие игрока:
Персонаж: ${action.characterName}
Тип: ${action.actionType}
Описание: "${action.content}"
${action.diceResult ? `Бросок: ${action.diceResult.type} = ${action.diceResult.value}` : ""}

Ответь JSON:
{
  "narration": "2-4 предложения описания того, что происходит в ответ на действие игрока",
  "mood": "neutral|tense|horror|triumphant|mysterious",
  "triggerMap": null,
  "triggerImage": null,
  "memoryUpdates": [],
  "nextActions": ["предложение 1", "предложение 2"]
}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed;
    try {
      const jsonMatch =
        rawText.match(/```json\n?([\s\S]*?)\n?```/) ||
        rawText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : rawText;
      parsed = JSON.parse(jsonStr);
    } catch {
      // If JSON parsing fails, wrap the raw text as narration
      parsed = {
        narration: rawText.slice(0, 500),
        mood: "neutral",
        triggerMap: null,
        triggerImage: null,
        memoryUpdates: [],
        nextActions: [],
      };
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ai-dm-orchestrator] Error:", message);

    return new Response(
      JSON.stringify({
        success: false,
        error: message
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
