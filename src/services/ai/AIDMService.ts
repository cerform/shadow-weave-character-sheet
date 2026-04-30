// ============================================================
// AIDMService — main frontend facade for all AI DM operations
// All AI calls go through this service, never directly to Supabase
// ============================================================

import { supabase } from '@/integrations/supabase/client';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PartyMember {
  name: string;
  race: string;
  class: string;
  level: number;
}

export type AIPersonality = 'epic' | 'dark' | 'merciless' | 'rules';
export type ActionType = 'speech' | 'movement' | 'attack' | 'skill' | 'item' | 'free';
export type AssetType = 'portrait' | 'location' | 'map' | 'monster' | 'item' | 'banner';
export type AssetStyle = 'fantasy' | 'dark_fantasy' | 'heroic' | 'horror';

export interface CampaignInitParams {
  campaignName: string;
  sessionId: string;
  aiPersonality: AIPersonality;
  party: PartyMember[];
  worldSeed?: string;      // Optional lore/setting seed from the DM
}

export interface CampaignInitResult {
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

export interface PlayerAction {
  sessionId: string;
  playerId: string;
  characterName: string;
  actionType: ActionType;
  content: string;
  diceResult?: { type: string; value: number };
}

export interface DMResponse {
  narration: string;
  mood: 'neutral' | 'tense' | 'horror' | 'triumphant' | 'mysterious';
  triggerMap: { needed: boolean; description: string } | null;
  triggerImage: { needed: boolean; subject: string; description: string } | null;
  memoryUpdates: Array<{ type: string; key: string; value: unknown }>;
  nextActions: string[];
}

export interface GeneratedImage {
  url: string;
  assetType: AssetType;
  subject: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class AIDMService {
  /**
   * Initialize a new AI campaign — generates world, villain, quests, opening
   * Saves results to campaign_context table
   */
  static async initCampaign(params: CampaignInitParams): Promise<CampaignInitResult> {
    console.log('[AIDMService] Initializing campaign:', params.campaignName);

    console.log('[AIDMService] Calling Edge Function: ai-campaign-init');
    const { data, error } = await supabase.functions.invoke('ai-campaign-init', {
      body: {
        campaignName: params.campaignName,
        aiPersonality: params.aiPersonality,
        party: params.party,
        worldSeed: params.worldSeed || null,
      },
    });

    let result: CampaignInitResult;

    if (error || !data?.success) {
      console.error('[AIDMService] Campaign init failed:', error?.message || data?.error);
      throw new Error(`AI Campaign Generation failed: ${error?.message || data?.error || 'Unknown error'}`);
    }
    
    result = data.data as CampaignInitResult;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[AIDMService] No user found for campaign initialization');
      return result;
    }

    // Save to campaign_context
    const { error: ctxError } = await supabase.from('campaign_context').upsert({
      session_id: params.sessionId,
      campaign_name: params.campaignName,
      ai_personality: params.aiPersonality,
      world_facts: result.worldFacts,
      short_summary: result.shortSummary,
      active_quests: result.initialQuests,
      npc_registry: {
        [result.mainVillain.name]: {
          role: 'main_villain',
          description: result.mainVillain.description,
          motivation: result.mainVillain.motivation,
          status: 'unknown', // party hasn't met them yet
        },
      },
      party_info: params.party,
      turn_count: 0,
      updated_at: new Date().toISOString(),
    });

    if (ctxError) console.error('[AIDMService] Error saving campaign context:', ctxError);

    // Log opening event (for history)
    const { error: eventError } = await supabase.from('campaign_events').insert({
      session_id: params.sessionId,
      turn_number: 0,
      event_type: 'campaign_init',
      actor: 'SYSTEM',
      content: result.openingScene,
      metadata: {
        worldFacts: result.worldFacts,
        mainVillain: result.mainVillain,
        startingLocation: result.startingLocation,
      },
    });

    if (eventError) console.error('[AIDMService] Error saving campaign event:', eventError);

    // Also insert into session_messages so it appears in Chat immediately
    const { error: msgError } = await supabase.from('session_messages').insert({
      session_id: params.sessionId,
      sender_name: 'AI Dungeon Master',
      message_type: 'ai',
      user_id: user.id, // Current user ID is required by RLS
      content: result.openingScene,
    });

    if (msgError) console.error('[AIDMService] Error saving session message:', msgError);

    // Save world facts to campaign_memory
    const { error: memError } = await supabase.from('campaign_memory').upsert([
      {
        session_id: params.sessionId,
        type: 'world_state',
        key: 'current_location',
        value: result.startingLocation,
      },
      {
        session_id: params.sessionId,
        type: 'npc',
        key: result.mainVillain.name,
        value: result.mainVillain,
      },
    ]);

    if (memError) console.error('[AIDMService] Error saving campaign memory:', memError);

    console.log('[AIDMService] Campaign initialized successfully');
    return result;
  }

  /**
   * Process a player action through the GM Orchestrator
   */
  static async processAction(
    action: PlayerAction,
    sessionId: string
  ): Promise<DMResponse> {
    // Load campaign context
    const { data: ctxRow } = await supabase
      .from('campaign_context')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!ctxRow) throw new Error('Campaign context not found');

    const { data, error } = await supabase.functions.invoke('ai-dm-orchestrator', {
      body: { action, context: ctxRow },
    });

    if (error) throw new Error(`Orchestrator error: ${error.message}`);

    const response = data as DMResponse;

    // Persist player action
    await supabase.from('campaign_events').insert({
      session_id: sessionId,
      turn_number: (ctxRow.turn_count ?? 0) + 1,
      event_type: 'player_action',
      actor: action.characterName,
      content: action.content,
      metadata: { actionType: action.actionType, diceResult: action.diceResult },
    });

    // Persist DM narration
    await supabase.from('campaign_events').insert({
      session_id: sessionId,
      turn_number: (ctxRow.turn_count ?? 0) + 1,
      event_type: 'dm_narration',
      actor: 'DM',
      content: response.narration,
      metadata: { mood: response.mood, nextActions: response.nextActions },
    });

    // Apply memory updates
    if (response.memoryUpdates?.length > 0) {
      const updates = response.memoryUpdates.map((u) => ({
        session_id: sessionId,
        type: u.type,
        key: u.key,
        value: u.value,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('campaign_memory').upsert(updates, {
        onConflict: 'session_id,type,key',
      });
    }

    // Update turn count and short summary
    await supabase.from('campaign_context').update({
      turn_count: (ctxRow.turn_count ?? 0) + 1,
      short_summary: `${ctxRow.short_summary ?? ''}\n[Ход ${(ctxRow.turn_count ?? 0) + 1}] ${action.characterName}: ${action.content} → ${response.narration.slice(0, 100)}...`.slice(-1500),
      updated_at: new Date().toISOString(),
    }).eq('session_id', sessionId);

    return response;
  }

  /**
   * Generate an image via FLUX.1 schnell (fal.ai)
   */
  static async generateImage(params: {
    assetType: AssetType;
    subject: string;
    prompt: string;
    style?: AssetStyle;
    sessionId?: string;
  }): Promise<GeneratedImage> {
    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: params,
    });

    if (error) throw new Error(`Image generation failed: ${error.message}`);
    if (!data.success) throw new Error(data.error ?? 'Unknown image error');

    // Optionally save to ai_assets
    if (params.sessionId) {
      await supabase.from('ai_assets').insert({
        session_id: params.sessionId,
        asset_type: params.assetType,
        subject: params.subject,
        prompt: data.promptUsed,
        url: data.url,
        model_used: data.model,
        status: 'ready',
      });
    }

    return {
      url: data.url,
      assetType: params.assetType,
      subject: params.subject,
    };
  }

  /**
   * Load the full event history for a session
   */
  static async getEventHistory(sessionId: string) {
    const { data, error } = await supabase
      .from('campaign_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_number', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Load campaign context for a session
   */
  static async getCampaignContext(sessionId: string) {
    const { data, error } = await supabase
      .from('campaign_context')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}
