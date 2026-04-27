// ============================================================
// ai-image-generator — Supabase Edge Function
// Model: FLUX.1 schnell via fal.ai
// Generates: portraits, locations, monsters, items, banners
// ============================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface ImageRequest {
  assetType: "portrait" | "location" | "map" | "monster" | "item" | "banner";
  subject: string;
  prompt: string;
  style?: "fantasy" | "dark_fantasy" | "heroic" | "horror";
  sessionId?: string;
}

// Style modifiers applied to every prompt
const STYLE_MODIFIERS: Record<string, string> = {
  fantasy:
    "high fantasy digital art, painterly, vibrant colors, detailed, epic lighting",
  dark_fantasy:
    "dark fantasy, grim atmosphere, muted colors, dramatic shadows, ominous",
  heroic:
    "heroic fantasy art, dynamic composition, bright, inspiring, cinematic",
  horror:
    "dark horror fantasy, unsettling, atmospheric fog, deep shadows, eerie",
};

// Asset-type specific suffixes
const ASSET_SUFFIXES: Record<string, string> = {
  portrait:
    "character portrait, upper body, detailed face, fantasy RPG style, professional illustration",
  location:
    "fantasy location, establishing shot, detailed environment, atmospheric lighting",
  map: "fantasy dungeon map, top-down view, illustrated, tabletop RPG style",
  monster:
    "fantasy monster design, full body, detailed anatomy, creature concept art",
  item: "fantasy item, detailed, magical glow, on dark background, RPG concept art",
  banner:
    "wide banner image, atmospheric, epic fantasy, cinematic composition, 16:9",
};

const IMAGE_SIZES: Record<string, { width: number; height: number }> = {
  portrait: { width: 512, height: 768 },
  location: { width: 768, height: 512 },
  map: { width: 1024, height: 1024 },
  monster: { width: 512, height: 768 },
  item: { width: 512, height: 512 },
  banner: { width: 1024, height: 576 },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { assetType, subject, prompt, style = "fantasy" } =
      (await req.json()) as ImageRequest;

    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) {
      throw new Error("FAL_API_KEY not configured");
    }

    // Build full prompt
    const styleModifier = STYLE_MODIFIERS[style] ?? STYLE_MODIFIERS.fantasy;
    const assetSuffix =
      ASSET_SUFFIXES[assetType] ?? ASSET_SUFFIXES.portrait;
    const fullPrompt = `${prompt}, ${assetSuffix}, ${styleModifier}`;
    const negativePrompt =
      "blurry, low quality, watermark, text, signature, ugly, deformed, nsfw";

    const size = IMAGE_SIZES[assetType] ?? { width: 512, height: 512 };

    console.log(`[ai-image] Generating ${assetType} for "${subject}"`);

    // Call fal.ai FLUX.1 schnell API
    const falResponse = await fetch(
      "https://fal.run/fal-ai/flux/schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          negative_prompt: negativePrompt,
          image_size: {
            width: size.width,
            height: size.height,
          },
          num_inference_steps: 4, // schnell = fast (4 steps)
          num_images: 1,
          enable_safety_checker: true,
        }),
      }
    );

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      throw new Error(`fal.ai error ${falResponse.status}: ${errText}`);
    }

    const falData = await falResponse.json();
    const imageUrl = falData.images?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL in fal.ai response");
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: imageUrl,
        assetType,
        subject,
        promptUsed: fullPrompt,
        model: "flux-schnell",
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ai-image-generator] Error:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});
