// ============================================================
// ai-campaign-init — Supabase Edge Function
// Generates the initial world, villain, quests, and opening
// scene when a new AI DM campaign is created
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

interface InitRequest {
  campaignName: string;
  aiPersonality: "epic" | "dark" | "merciless" | "rules";
  party: Array<{
    name: string;
    race: string;
    class: string;
    level: number;
  }>;
  worldSeed?: string | null;  // Optional lore/setting notes from the DM
}

interface CampaignInitResult {
  worldFacts: Record<string, unknown>;
  openingScene: string;
  mainVillain: {
    name: string;
    description: string;
    motivation: string;
    personalConnectionToParty: string;
  };
  startingLocation: {
    name: string;
    description: string;
    imagePrompt: string;
  };
  initialQuests: Array<{
    title: string;
    description: string;
    reward: string;
    difficulty: string;
  }>;
  shortSummary: string;
  atmosphereImagePrompt: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { campaignName, aiPersonality, party, worldSeed } =
      (await req.json()) as InitRequest;

    const partyText = party
      .map((p) => `${p.name} — ${p.race} ${p.class} ${p.level} ур.`)
      .join(", ");

    const personalityInstructions: Record<string, string> = {
      epic:
        "Высокое фэнтези, великие угрозы, героический тон. Угроза масштабная — судьба мира.",
      dark:
        "Тёмное фэнтези, нравственные дилеммы, ужас. Мир жесток, добро редко побеждает.",
      merciless:
        "Хардкор — мир смертелен, враги умны, ресурсы ограничены. Каждое решение важно.",
      rules:
        "Точная механика D&D 5e SRD. Всё структурировано, enemies имеют stat блоки.",
    };

    const system = `Ты — генератор D&D кампаний. Создай уникальный, детальный и атмосферный мир.
Стиль: ${aiPersonality.toUpperCase()} — ${personalityInstructions[aiPersonality]}
Отвечай ТОЛЬКО валидным JSON по указанной схеме.`;

    const userPrompt = `Создай стартовый мир для D&D 5e кампании:

Название: "${campaignName}"
Партия: ${partyText}${worldSeed ? `

📜 ЗАМЕТКИ МАСТЕРА (используй как основу, расшири и детализируй):
${worldSeed}` : ""}

Создай:
1. Уникальный мир с историей и особенностями${worldSeed ? " (расширяй указанные заметки)" : ""}
2. Центрального злодея с личной связью к КАЖДОМУ члену партии
3. Стартовую локацию с атмосферным описанием
4. 2-3 начальных квеста разной сложности
5. Захватывающую открывающую сцену (3-5 предложений), в которой фигурируют ИМЕНА всех членов партии

Верни JSON:
${JSON.stringify(
  {
    worldFacts: {
      settingName: "название сеттинга",
      era: "эпоха",
      mainTheme: "центральная тема кампании",
      geography: "ключевые особенности мира",
      currentCrisis: "нависшая угроза",
      factions: [{ name: "фракция", alignment: "мировоззрение", goal: "цель" }],
    },
    openingScene: "Захватывающее вступление 3-5 предложений с именами персонажей",
    mainVillain: {
      name: "имя злодея",
      description: "внешность и характер",
      motivation: "что движет злодеем",
      personalConnectionToParty: "личная связь с партией",
    },
    startingLocation: {
      name: "название",
      description: "3-4 предложения атмосферного описания",
      imagePrompt:
        "подробный English prompt для генерации изображения локации в fantasy стиле",
    },
    initialQuests: [
      {
        title: "название",
        description: "2-3 предложения",
        reward: "описание награды",
        difficulty: "Easy|Medium|Hard",
      },
    ],
    shortSummary:
      "1-2 предложения для контекста AI — главная ситуация на старте",
    atmosphereImagePrompt:
      "English prompt для генерации атмосферного арта кампании (banner)",
  },
  null,
  2
)}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed: CampaignInitResult;
    try {
      const jsonMatch =
        rawText.match(/```json\n?([\s\S]*?)\n?```/) ||
        rawText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : rawText;
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error("Failed to parse Claude response as JSON");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: parsed,
        usage: response.usage,
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ai-campaign-init] Error:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});
