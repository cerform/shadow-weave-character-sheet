import { supabase } from "@/integrations/supabase/client";
import { BestiaryEntry } from "@/types/Monster";

export async function getBestiaryEntry(slug: string): Promise<BestiaryEntry> {
  const { data, error } = await supabase
    .from('bestiary')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch bestiary entry: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Bestiary entry not found: ${slug}`);
  }

  return data as BestiaryEntry;
}

export async function getAllBestiaryEntries(): Promise<BestiaryEntry[]> {
  const { data, error } = await supabase
    .from('bestiary')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch bestiary entries: ${error.message}`);
  }

  return (data || []) as BestiaryEntry[];
}

export async function searchBestiaryEntries(query: string): Promise<BestiaryEntry[]> {
  const { data, error } = await supabase
    .from('bestiary')
    .select('*')
    .or(`name.ilike.%${query}%,creature_type.ilike.%${query}%,cr_or_level.ilike.%${query}%`)
    .order('name');

  if (error) {
    throw new Error(`Failed to search bestiary entries: ${error.message}`);
  }

  return (data || []) as BestiaryEntry[];
}