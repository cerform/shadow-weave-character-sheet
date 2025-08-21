import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MESHY_API_KEY = Deno.env.get('MESHY_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface MeshyModel {
  id: string;
  name: string;
  thumbnail: string;
  model_urls: {
    glb?: string;
    gltf?: string;
    fbx?: string;
    obj?: string;
  };
  tags: string[];
  created_at: string;
}

interface MeshySearchResponse {
  data: MeshyModel[];
  total: number;
  page: number;
  per_page: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { action, query, tags, page = 1, limit = 20 } = await req.json();

    console.log(`Meshy API request: ${action}`, { query, tags, page, limit });

    if (!MESHY_API_KEY) {
      throw new Error('MESHY_API_KEY not configured');
    }

    switch (action) {
      case 'search': {
        // Поиск D&D моделей на Meshy
        const searchParams = new URLSearchParams({
          q: query || 'dnd dungeons dragons',
          tags: tags?.join(',') || 'dnd,fantasy,character,monster',
          page: page.toString(),
          per_page: limit.toString(),
          format: 'glb,gltf'
        });

        const response = await fetch(`https://api.meshy.ai/v2/text-to-3d/search?${searchParams}`, {
          headers: {
            'Authorization': `Bearer ${MESHY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Meshy API error:', response.status, errorText);
          throw new Error(`Meshy API error: ${response.status} ${errorText}`);
        }

        const data: MeshySearchResponse = await response.json();
        console.log(`Found ${data.data.length} models`);

        return new Response(JSON.stringify({
          success: true,
          models: data.data,
          total: data.total,
          page: data.page,
          hasMore: data.page * data.per_page < data.total
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'download': {
        const { modelId, monsterName } = await req.json();
        
        // Получаем детали модели
        const modelResponse = await fetch(`https://api.meshy.ai/v2/text-to-3d/${modelId}`, {
          headers: {
            'Authorization': `Bearer ${MESHY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!modelResponse.ok) {
          throw new Error(`Failed to get model details: ${modelResponse.status}`);
        }

        const model: MeshyModel = await modelResponse.json();
        
        // Выбираем лучший формат (GLB предпочтительнее)
        const modelUrl = model.model_urls.glb || model.model_urls.gltf;
        
        if (!modelUrl) {
          throw new Error('No suitable 3D model format found');
        }

        // Сохраняем в models bucket
        const fileName = `meshy/${monsterName.toLowerCase().replace(/\s+/g, '-')}-${modelId}.glb`;
        
        // Скачиваем модель
        const modelFileResponse = await fetch(modelUrl);
        if (!modelFileResponse.ok) {
          throw new Error(`Failed to download model: ${modelFileResponse.status}`);
        }

        const modelBuffer = await modelFileResponse.arrayBuffer();
        
        // Загружаем в Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('models')
          .upload(fileName, modelBuffer, {
            contentType: 'model/gltf-binary',
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload model: ${uploadError.message}`);
        }

        // Получаем публичный URL
        const { data: { publicUrl } } = supabase.storage
          .from('models')
          .getPublicUrl(fileName);

        console.log(`Model uploaded successfully: ${publicUrl}`);

        return new Response(JSON.stringify({
          success: true,
          modelUrl: publicUrl,
          fileName,
          originalModel: model
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'autocomplete': {
        // Автозавершение для поиска D&D терминов
        const dndTerms = [
          'dragon', 'goblin', 'orc', 'troll', 'skeleton', 'zombie',
          'knight', 'wizard', 'paladin', 'rogue', 'barbarian', 'monk',
          'elf', 'dwarf', 'halfling', 'tiefling', 'dragonborn',
          'beholder', 'mind flayer', 'aboleth', 'demon', 'devil',
          'giant', 'elemental', 'golem', 'ooze', 'undead'
        ];

        const filtered = dndTerms.filter(term => 
          term.toLowerCase().includes((query || '').toLowerCase())
        ).slice(0, 10);

        return new Response(JSON.stringify({
          success: true,
          suggestions: filtered
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in meshy-models function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});