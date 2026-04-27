// ============================================================
// AI DM Orchestrator — Supabase Edge Function
// Model: Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
// Role: Master agent — receives player action, decides which
//       sub-agents to invoke, returns structured DM response
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

// ─── Types ─────────────────────────────────────────────────────────────────

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
  ai_personality: "epic" | "dark" | "merciless" | "rules";
  short_summary: string;
  world_facts: Record<string, unknown>;
  active_quests: unknown[];
  npc_registry: Record<string, unknown>;
  party_info: unknown[];
  turn_count: number;
}

interface OrchestratorResponseRaw {
  narration: string;
  dm_inner_thoughts?: string;
  map_needed?: boolean;
  map_description?: string;
  image_needed?: boolean;
  image_subject?: string;
  image_description?: string;
  rules_check_needed?: boolean;
  rules_query?: string;
  memory_updates?: Array<{
    type: string;
    key: string;
    value: unknown;
  }>;
  next_expected_actions?: string[];
  mood?: "neutral" | "tense" | "horror" | "triumphant" | "mysterious";
}

// ─── Personality Prompts ────────────────────────────────────────────────────

const PERSONALITY_FLAVORS: Record<string, string> = {
  epic:
    "Используй высокопарный язык, героические описания, вдохновляющие моменты. Мир полон чудес и опасностей.",
  dark:
    "Атмосфера мрака, ужаса и moral ambiguity. Мир жесток, свет редок. Используй нуар и хоррор элементы.",
  merciless:
    "Хардкор: ошибки имеют последствия, враги умны. Никакой пощады, высокая ставка каждого решения.",
  rules:
    "Строго следуй D&D 5e SRD 2014. Каждое действие требует проверки правил. Точность mechanic важнее dramatic.",
};

// ─── System Prompt Builder ──────────────────────────────────────────────────

function buildSystemPrompt(ctx: CampaignContext): string {
  const partyList = Array.isArray(ctx.party_info)
    ? ctx.party_info
        .map(
          (p: { name?: string; race?: string; class?: string; level?: number }) =>
            `• ${p.name} (${p.race} ${p.class}, ${p.level} ур.)`
        )
        .join("\n")
    : "Партия не указана";

  const questsText =
    Array.isArray(ctx.active_quests) && ctx.active_quests.length > 0
      ? ctx.active_quests
          .map(
            (q: { title?: string; description?: string }) =>
              `• ${q.title}: ${q.description}`
          )
          .join("\n")
      : "Активных квестов нет";

  return `Ты — Мастер Подземелий в кампании D&D 5e.

═══ КАМПАНИЯ ═══
Название: ${ctx.campaign_name}
Стиль: ${ctx.ai_personality.toUpperCase()} — ${PERSONALITY_FLAVORS[ctx.ai_personality]}

═══ МИР ═══
${ctx.short_summary || "Начало кампании — история только разворачивается."}

Ключевые факты:
${JSON.stringify(ctx.world_facts, null, 2)}

═══ ПАРТИЯ ═══
${partyList}

═══ АКТИВНЫЕ КВЕСТЫ ═══
${questsText}

═══ ИНСТРУКЦИИ ═══
1. Отвечай НА ДЕЙСТВИЕ игрока, двигай историю вперёд
2. Описания — от 2 до 5 предложений, живо и атмосферно
3. Если сцена требует карты, укажи map_needed: true и map_description
4. Если появился новый важный NPC — укажи image_needed: true с описанием
5. Обновляй memory_updates при изменении фактов мира
6. Предлагай 2-3 варианта следующих действий в next_expected_actions

ВАЖНО: Отвечай ТОЛЬКО валидным JSON по схеме OrchestratorResponse.`;
}

// ─── Main Handler ───────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const { action, context } = body as {
      action: PlayerAction;
      context: CampaignContext;
    };

    if (!action || !context) {
      return new Response(
        JSON.stringify({ error: "Missing action or context" }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Build user message
    const userMessage = buildUserMessage(action);

    // Call Claude 3.5 Sonnet
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: buildSystemPrompt(context),
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from Claude response
    let parsed: OrchestratorResponseRaw;
    try {
      // Claude sometimes wraps JSON in ```json ... ```
      const jsonMatch = rawText.match(/```json\n?([\s\S]*?)\n?```/) ||
        rawText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : rawText;
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback: treat raw text as narration
      parsed = { narration: rawText };
    }

    // Build structured response
    const result = {
      narration: parsed.narration ?? "Мастер молчит...",
      mood: parsed.mood ?? "neutral",
      triggerMap: parsed.map_needed
        ? {
            needed: true,
            description: parsed.map_description ?? "",
          }
        : null,
      triggerImage: parsed.image_needed
        ? {
            needed: true,
            subject: parsed.image_subject ?? "",
            description: parsed.image_description ?? "",
          }
        : null,
      triggerRules: parsed.rules_check_needed
        ? {
            needed: true,
            query: parsed.rules_query ?? "",
          }
        : null,
      memoryUpdates: parsed.memory_updates ?? [],
      nextActions: parsed.next_expected_actions ?? [],
      model: "claude-3-5-sonnet-20241022",
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ai-dm-orchestrator] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});

// ─── Helper ─────────────────────────────────────────────────────────────────

function buildUserMessage(action: PlayerAction): string {
  const parts = [`**${action.characterName}** (${action.actionType}):`];

  if (action.content) parts.push(action.content);

  if (action.diceResult) {
    parts.push(
      `\n[Бросок: ${action.diceResult.type} = ${action.diceResult.value}]`
    );
  }

  parts.push("\n\nОтветь валидным JSON по схеме OrchestratorResponse:");
  parts.push(
    JSON.stringify({
      narration: "string (2-5 предложений)",
      mood: "neutral|tense|horror|triumphant|mysterious",
      map_needed: "boolean",
      map_description: "string (если map_needed)",
      image_needed: "boolean",
      image_subject: "string (если image_needed)",
      image_description: "string (если image_needed)",
      rules_check_needed: "boolean",
      rules_query: "string (если rules_check_needed)",
      memory_updates: [
        { type: "world_state|npc|quest|lore", key: "string", value: "any" },
      ],
      next_expected_actions: ["string", "string", "string"],
    })
  );

  return parts.join("\n");
}
