import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { monsters, category } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    if (!monsters || !Array.isArray(monsters)) {
      throw new Error('Monsters array is required');
    }

    console.log(`Generating images for ${monsters.length} ${category || 'unknown'} monsters`);

    const generatedImages = [];

    // Generate images for each monster
    for (const monster of monsters) {
      try {
        const prompt = `Fantasy D&D monster token: ${monster.name}. ${monster.description || 'Detailed fantasy creature'}. Professional game art style, round token format, high detail, fantasy RPG style, clean background, centered composition, 1024x1024 resolution`;
        
        console.log(`Generating image for ${monster.name} with prompt: ${prompt}`);
        
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'high',
            output_format: 'webp'
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          console.error(`Error generating image for ${monster.name}:`, data.error);
          generatedImages.push({
            name: monster.name,
            error: data.error.message
          });
          continue;
        }

        const imageUrl = data.data[0].url;
        console.log(`Successfully generated image for ${monster.name}`);
        
        generatedImages.push({
          name: monster.name,
          imageUrl: imageUrl,
          prompt: prompt
        });

      } catch (error) {
        console.error(`Error generating image for ${monster.name}:`, error);
        generatedImages.push({
          name: monster.name,
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      images: generatedImages,
      totalGenerated: generatedImages.filter(img => img.imageUrl).length,
      totalRequested: monsters.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-monster-images function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});