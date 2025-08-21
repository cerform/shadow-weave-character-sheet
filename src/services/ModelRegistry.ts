import { supabase } from "@/integrations/supabase/client";
import { ModelRegistryEntry } from "@/types/Monster";

const PLACEHOLDER_URL = "https://mqdjwhjtvjnktobgruuu.supabase.co/storage/v1/object/public/models/placeholder.glb";

export async function getModelForSlug(slug: string): Promise<ModelRegistryEntry> {
  const { data, error } = await supabase
    .from('model_registry')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.warn(`Failed to fetch model registry entry: ${error.message}`);
  }

  // Fallback к заглушке если модель не найдена
  if (!data) {
    return {
      id: `fallback-${slug}`,
      slug,
      model_url: PLACEHOLDER_URL,
      scale: 1.0,
      y_offset: 0,
      animations: {}
    };
  }

  // Гарантируем, что все поля заполнены
  return {
    ...data,
    model_url: data.model_url || PLACEHOLDER_URL,
    scale: data.scale ?? 1.0,
    y_offset: data.y_offset ?? 0,
    animations: data.animations || {}
  } as ModelRegistryEntry;
}

export async function getAllModels(): Promise<ModelRegistryEntry[]> {
  const { data, error } = await supabase
    .from('model_registry')
    .select('*')
    .order('slug');

  if (error) {
    console.warn(`Failed to fetch model registry: ${error.message}`);
    return [];
  }

  return (data || []) as ModelRegistryEntry[];
}