import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Initialize Supabase client for server-side operations
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY FIX: Authenticate user and check permissions
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        success: false 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication token',
        success: false 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has DM or admin role
    const { data: userRoles, error: rolesError } = await supabase
      .rpc('get_user_roles', { _user_id: user.id });

    if (rolesError) {
      console.error('Error checking user roles:', rolesError);
      return new Response(JSON.stringify({ 
        error: 'Permission check failed',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const roles = Array.isArray(userRoles) ? userRoles : [];
    const canGenerateImages = roles.includes('admin') || roles.includes('dm');

    if (!canGenerateImages) {
      return new Response(JSON.stringify({ 
        error: 'Access denied: Only DMs and administrators can generate monster images',
        success: false 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { monsters, category } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // SECURITY FIX: Input validation and sanitization
    if (!monsters || !Array.isArray(monsters)) {
      throw new Error('Monsters array is required');
    }

    if (monsters.length > 20) {
      throw new Error('Too many monsters requested (maximum 20 allowed)');
    }

    // Validate and sanitize each monster
    const sanitizedMonsters = monsters.map((monster, index) => {
      if (!monster || typeof monster !== 'object') {
        throw new Error(`Invalid monster at index ${index}`);
      }
      
      if (!monster.name || typeof monster.name !== 'string') {
        throw new Error(`Monster name is required at index ${index}`);
      }
      
      // Sanitize name and description
      const name = monster.name.substring(0, 100).replace(/[<>\"'&]/g, '');
      const description = monster.description ? 
        monster.description.substring(0, 500).replace(/[<>\"'&]/g, '') : 
        '';
      
      if (!name.trim()) {
        throw new Error(`Monster name cannot be empty at index ${index}`);
      }
      
      return { name, description };
    });

    console.log(`Generating images for ${sanitizedMonsters.length} ${category || 'unknown'} monsters`);

    const generatedImages = [];

    // Generate images for each monster
    for (const monster of sanitizedMonsters) {
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