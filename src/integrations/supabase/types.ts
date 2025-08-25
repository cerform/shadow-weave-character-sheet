export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      asset_categories: {
        Row: {
          created_at: string | null
          id: string
          key: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          approved: boolean | null
          category_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          license: string | null
          lod: number | null
          meta: Json | null
          name: string
          pivot: Json | null
          preview_url: string | null
          scale_x: number | null
          scale_y: number | null
          scale_z: number | null
          size_bytes: number | null
          source_url: string | null
          storage_path: string
          tags: string[] | null
        }
        Insert: {
          approved?: boolean | null
          category_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          license?: string | null
          lod?: number | null
          meta?: Json | null
          name: string
          pivot?: Json | null
          preview_url?: string | null
          scale_x?: number | null
          scale_y?: number | null
          scale_z?: number | null
          size_bytes?: number | null
          source_url?: string | null
          storage_path: string
          tags?: string[] | null
        }
        Update: {
          approved?: boolean | null
          category_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          license?: string | null
          lod?: number | null
          meta?: Json | null
          name?: string
          pivot?: Json | null
          preview_url?: string | null
          scale_x?: number | null
          scale_y?: number | null
          scale_z?: number | null
          size_bytes?: number | null
          source_url?: string | null
          storage_path?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "asset_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_entities: {
        Row: {
          ac: number
          created_at: string
          created_by: string
          creature_type: string
          hp_current: number
          hp_max: number
          id: string
          is_player_character: boolean | null
          level_or_cr: string
          model_url: string
          name: string
          pos_x: number
          pos_y: number
          pos_z: number
          rot_y: number
          scale: number
          session_id: string
          size: string
          slug: string
          speed: number
          statuses: string[] | null
          updated_at: string
        }
        Insert: {
          ac: number
          created_at?: string
          created_by: string
          creature_type: string
          hp_current: number
          hp_max: number
          id?: string
          is_player_character?: boolean | null
          level_or_cr: string
          model_url: string
          name: string
          pos_x?: number
          pos_y?: number
          pos_z?: number
          rot_y?: number
          scale?: number
          session_id: string
          size: string
          slug: string
          speed: number
          statuses?: string[] | null
          updated_at?: string
        }
        Update: {
          ac?: number
          created_at?: string
          created_by?: string
          creature_type?: string
          hp_current?: number
          hp_max?: number
          id?: string
          is_player_character?: boolean | null
          level_or_cr?: string
          model_url?: string
          name?: string
          pos_x?: number
          pos_y?: number
          pos_z?: number
          rot_y?: number
          scale?: number
          session_id?: string
          size?: string
          slug?: string
          speed?: number
          statuses?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      battle_maps: {
        Row: {
          background_color: string | null
          created_at: string | null
          grid_size: number | null
          height: number
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          session_id: string
          updated_at: string | null
          width: number
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          grid_size?: number | null
          height?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          session_id: string
          updated_at?: string | null
          width?: number
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          grid_size?: number | null
          height?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          session_id?: string
          updated_at?: string | null
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_maps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_tokens: {
        Row: {
          armor_class: number | null
          character_id: string | null
          color: string | null
          conditions: Json | null
          created_at: string | null
          current_hp: number | null
          id: string
          image_url: string | null
          is_hidden_from_players: boolean | null
          is_visible: boolean | null
          map_id: string | null
          max_hp: number | null
          name: string
          notes: string | null
          position_x: number
          position_y: number
          session_id: string
          size: number | null
          token_type: string
          updated_at: string | null
        }
        Insert: {
          armor_class?: number | null
          character_id?: string | null
          color?: string | null
          conditions?: Json | null
          created_at?: string | null
          current_hp?: number | null
          id?: string
          image_url?: string | null
          is_hidden_from_players?: boolean | null
          is_visible?: boolean | null
          map_id?: string | null
          max_hp?: number | null
          name: string
          notes?: string | null
          position_x?: number
          position_y?: number
          session_id: string
          size?: number | null
          token_type?: string
          updated_at?: string | null
        }
        Update: {
          armor_class?: number | null
          character_id?: string | null
          color?: string | null
          conditions?: Json | null
          created_at?: string | null
          current_hp?: number | null
          id?: string
          image_url?: string | null
          is_hidden_from_players?: boolean | null
          is_visible?: boolean | null
          map_id?: string | null
          max_hp?: number | null
          name?: string
          notes?: string | null
          position_x?: number
          position_y?: number
          session_id?: string
          size?: number | null
          token_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_tokens_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "battle_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      bestiary: {
        Row: {
          ac: number
          actions: string[] | null
          cha_score: number | null
          con_score: number | null
          condition_immunities: string[] | null
          cr_or_level: string
          created_at: string
          creature_type: string
          damage_immunities: string[] | null
          damage_resistances: string[] | null
          damage_vulnerabilities: string[] | null
          dex_score: number | null
          hp_average: number
          hp_formula: string | null
          id: string
          int_score: number | null
          languages: string | null
          legendary_actions: string[] | null
          name: string
          reactions: string[] | null
          saving_throws: Json | null
          senses: string | null
          size: string
          skills: Json | null
          slug: string
          speed_burrow: number | null
          speed_climb: number | null
          speed_fly: number | null
          speed_swim: number | null
          speed_walk: number | null
          str_score: number | null
          traits: string[] | null
          updated_at: string
          wis_score: number | null
        }
        Insert: {
          ac: number
          actions?: string[] | null
          cha_score?: number | null
          con_score?: number | null
          condition_immunities?: string[] | null
          cr_or_level: string
          created_at?: string
          creature_type: string
          damage_immunities?: string[] | null
          damage_resistances?: string[] | null
          damage_vulnerabilities?: string[] | null
          dex_score?: number | null
          hp_average: number
          hp_formula?: string | null
          id?: string
          int_score?: number | null
          languages?: string | null
          legendary_actions?: string[] | null
          name: string
          reactions?: string[] | null
          saving_throws?: Json | null
          senses?: string | null
          size: string
          skills?: Json | null
          slug: string
          speed_burrow?: number | null
          speed_climb?: number | null
          speed_fly?: number | null
          speed_swim?: number | null
          speed_walk?: number | null
          str_score?: number | null
          traits?: string[] | null
          updated_at?: string
          wis_score?: number | null
        }
        Update: {
          ac?: number
          actions?: string[] | null
          cha_score?: number | null
          con_score?: number | null
          condition_immunities?: string[] | null
          cr_or_level?: string
          created_at?: string
          creature_type?: string
          damage_immunities?: string[] | null
          damage_resistances?: string[] | null
          damage_vulnerabilities?: string[] | null
          dex_score?: number | null
          hp_average?: number
          hp_formula?: string | null
          id?: string
          int_score?: number | null
          languages?: string | null
          legendary_actions?: string[] | null
          name?: string
          reactions?: string[] | null
          saving_throws?: Json | null
          senses?: string | null
          size?: string
          skills?: Json | null
          slug?: string
          speed_burrow?: number | null
          speed_climb?: number | null
          speed_fly?: number | null
          speed_swim?: number | null
          speed_walk?: number | null
          str_score?: number | null
          traits?: string[] | null
          updated_at?: string
          wis_score?: number | null
        }
        Relationships: []
      }
      character_models: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          description: string | null
          download_url: string | null
          file_format: string | null
          file_size: number | null
          id: string
          is_approved: boolean | null
          likes: number | null
          meshy_id: string | null
          model_url: string | null
          name: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          download_url?: string | null
          file_format?: string | null
          file_size?: number | null
          id?: string
          is_approved?: boolean | null
          likes?: number | null
          meshy_id?: string | null
          model_url?: string | null
          name: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          download_url?: string | null
          file_format?: string | null
          file_size?: number | null
          id?: string
          is_approved?: boolean | null
          likes?: number | null
          meshy_id?: string | null
          model_url?: string | null
          name?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          alignment: string | null
          armor_class: number
          background: string | null
          backstory: string | null
          charisma: number
          class: string
          constitution: number
          created_at: string
          current_hp: number
          dexterity: number
          equipment: Json | null
          experience: number | null
          gender: string | null
          hit_points: Json | null
          id: string
          intelligence: number
          level: number
          max_hp: number
          money: Json | null
          name: string
          proficiencies: Json | null
          proficiency_bonus: number | null
          race: string
          speed: number | null
          spells: Json | null
          stats: Json | null
          strength: number
          subclass: string | null
          subrace: string | null
          updated_at: string
          user_id: string
          wisdom: number
        }
        Insert: {
          alignment?: string | null
          armor_class?: number
          background?: string | null
          backstory?: string | null
          charisma?: number
          class: string
          constitution?: number
          created_at?: string
          current_hp?: number
          dexterity?: number
          equipment?: Json | null
          experience?: number | null
          gender?: string | null
          hit_points?: Json | null
          id?: string
          intelligence?: number
          level?: number
          max_hp?: number
          money?: Json | null
          name: string
          proficiencies?: Json | null
          proficiency_bonus?: number | null
          race: string
          speed?: number | null
          spells?: Json | null
          stats?: Json | null
          strength?: number
          subclass?: string | null
          subrace?: string | null
          updated_at?: string
          user_id: string
          wisdom?: number
        }
        Update: {
          alignment?: string | null
          armor_class?: number
          background?: string | null
          backstory?: string | null
          charisma?: number
          class?: string
          constitution?: number
          created_at?: string
          current_hp?: number
          dexterity?: number
          equipment?: Json | null
          experience?: number | null
          gender?: string | null
          hit_points?: Json | null
          id?: string
          intelligence?: number
          level?: number
          max_hp?: number
          money?: Json | null
          name?: string
          proficiencies?: Json | null
          proficiency_bonus?: number | null
          race?: string
          speed?: number | null
          spells?: Json | null
          stats?: Json | null
          strength?: number
          subclass?: string | null
          subrace?: string | null
          updated_at?: string
          user_id?: string
          wisdom?: number
        }
        Relationships: []
      }
      fog_of_war: {
        Row: {
          created_at: string
          grid_x: number
          grid_y: number
          id: string
          is_revealed: boolean
          map_id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grid_x: number
          grid_y: number
          id?: string
          is_revealed?: boolean
          map_id: string
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grid_x?: number
          grid_y?: number
          id?: string
          is_revealed?: boolean
          map_id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          created_at: string | null
          current_map_id: string | null
          description: string | null
          dm_id: string
          ended_at: string | null
          fog_of_war_enabled: boolean | null
          grid_enabled: boolean | null
          grid_size: number | null
          id: string
          is_active: boolean | null
          max_players: number | null
          name: string
          session_code: string
          updated_at: string | null
          view_center_x: number | null
          view_center_y: number | null
          zoom_level: number | null
        }
        Insert: {
          created_at?: string | null
          current_map_id?: string | null
          description?: string | null
          dm_id: string
          ended_at?: string | null
          fog_of_war_enabled?: boolean | null
          grid_enabled?: boolean | null
          grid_size?: number | null
          id?: string
          is_active?: boolean | null
          max_players?: number | null
          name: string
          session_code: string
          updated_at?: string | null
          view_center_x?: number | null
          view_center_y?: number | null
          zoom_level?: number | null
        }
        Update: {
          created_at?: string | null
          current_map_id?: string | null
          description?: string | null
          dm_id?: string
          ended_at?: string | null
          fog_of_war_enabled?: boolean | null
          grid_enabled?: boolean | null
          grid_size?: number | null
          id?: string
          is_active?: boolean | null
          max_players?: number | null
          name?: string
          session_code?: string
          updated_at?: string | null
          view_center_x?: number | null
          view_center_y?: number | null
          zoom_level?: number | null
        }
        Relationships: []
      }
      initiative_tracker: {
        Row: {
          character_name: string
          created_at: string | null
          has_acted_this_turn: boolean | null
          id: string
          initiative_modifier: number | null
          initiative_roll: number
          is_current_turn: boolean | null
          round_number: number | null
          session_id: string
          token_id: string | null
          turn_order: number
          updated_at: string | null
        }
        Insert: {
          character_name: string
          created_at?: string | null
          has_acted_this_turn?: boolean | null
          id?: string
          initiative_modifier?: number | null
          initiative_roll: number
          is_current_turn?: boolean | null
          round_number?: number | null
          session_id: string
          token_id?: string | null
          turn_order: number
          updated_at?: string | null
        }
        Update: {
          character_name?: string
          created_at?: string | null
          has_acted_this_turn?: boolean | null
          id?: string
          initiative_modifier?: number | null
          initiative_roll?: number
          is_current_turn?: boolean | null
          round_number?: number | null
          session_id?: string
          token_id?: string | null
          turn_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiative_tracker_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_tracker_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "battle_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      map_entities: {
        Row: {
          ac: number | null
          asset_id: string
          created_at: string | null
          data: Json | null
          hp: number | null
          id: string
          initiative: number | null
          is_locked: boolean | null
          map_id: string
          max_hp: number | null
          owner_id: string | null
          rot_x: number | null
          rot_y: number | null
          rot_z: number | null
          scale_x: number | null
          scale_y: number | null
          scale_z: number | null
          type: string
          updated_at: string | null
          x: number
          y: number
          z: number
        }
        Insert: {
          ac?: number | null
          asset_id: string
          created_at?: string | null
          data?: Json | null
          hp?: number | null
          id?: string
          initiative?: number | null
          is_locked?: boolean | null
          map_id: string
          max_hp?: number | null
          owner_id?: string | null
          rot_x?: number | null
          rot_y?: number | null
          rot_z?: number | null
          scale_x?: number | null
          scale_y?: number | null
          scale_z?: number | null
          type: string
          updated_at?: string | null
          x: number
          y: number
          z: number
        }
        Update: {
          ac?: number | null
          asset_id?: string
          created_at?: string | null
          data?: Json | null
          hp?: number | null
          id?: string
          initiative?: number | null
          is_locked?: boolean | null
          map_id?: string
          max_hp?: number | null
          owner_id?: string | null
          rot_x?: number | null
          rot_y?: number | null
          rot_z?: number | null
          scale_x?: number | null
          scale_y?: number | null
          scale_z?: number | null
          type?: string
          updated_at?: string | null
          x?: number
          y?: number
          z?: number
        }
        Relationships: [
          {
            foreignKeyName: "map_entities_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_entities_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "battle_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      model_registry: {
        Row: {
          animations: Json | null
          author: string | null
          created_at: string
          id: string
          license: string | null
          model_url: string
          preview_url: string | null
          scale: number | null
          slug: string
          updated_at: string
          y_offset: number | null
        }
        Insert: {
          animations?: Json | null
          author?: string | null
          created_at?: string
          id?: string
          license?: string | null
          model_url: string
          preview_url?: string | null
          scale?: number | null
          slug: string
          updated_at?: string
          y_offset?: number | null
        }
        Update: {
          animations?: Json | null
          author?: string | null
          created_at?: string
          id?: string
          license?: string | null
          model_url?: string
          preview_url?: string | null
          scale?: number | null
          slug?: string
          updated_at?: string
          y_offset?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          target_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      session_messages: {
        Row: {
          content: string
          created_at: string | null
          dice_roll_data: Json | null
          id: string
          is_whisper: boolean | null
          message_type: string
          sender_name: string
          session_id: string
          user_id: string
          whisper_to_user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          dice_roll_data?: Json | null
          id?: string
          is_whisper?: boolean | null
          message_type?: string
          sender_name: string
          session_id: string
          user_id: string
          whisper_to_user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          dice_roll_data?: Json | null
          id?: string
          is_whisper?: boolean | null
          message_type?: string
          sender_name?: string
          session_id?: string
          user_id?: string
          whisper_to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_players: {
        Row: {
          character_id: string | null
          id: string
          is_online: boolean | null
          is_visible: boolean | null
          joined_at: string | null
          last_seen: string | null
          player_name: string
          position_x: number | null
          position_y: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          character_id?: string | null
          id?: string
          is_online?: boolean | null
          is_visible?: boolean | null
          joined_at?: string | null
          last_seen?: string | null
          player_name: string
          position_x?: number | null
          position_y?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          character_id?: string | null
          id?: string
          is_online?: boolean | null
          is_visible?: boolean | null
          joined_at?: string | null
          last_seen?: string | null
          player_name?: string
          position_x?: number | null
          position_y?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      srd_classes: {
        Row: {
          asset_id: string | null
          created_at: string
          features: Json | null
          hit_die: number | null
          id: string
          name: string
          proficiencies: Json | null
          saving_throws: string[] | null
          slug: string
          spellcasting: Json | null
          starting_equipment: Json | null
          token_asset_id: string | null
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          features?: Json | null
          hit_die?: number | null
          id?: string
          name: string
          proficiencies?: Json | null
          saving_throws?: string[] | null
          slug: string
          spellcasting?: Json | null
          starting_equipment?: Json | null
          token_asset_id?: string | null
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          features?: Json | null
          hit_die?: number | null
          id?: string
          name?: string
          proficiencies?: Json | null
          saving_throws?: string[] | null
          slug?: string
          spellcasting?: Json | null
          starting_equipment?: Json | null
          token_asset_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "srd_classes_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srd_classes_token_asset_id_fkey"
            columns: ["token_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      srd_creatures: {
        Row: {
          actions: Json | null
          alignment: string | null
          armor_class: number | null
          asset_id: string | null
          cr: number | null
          created_at: string
          hit_dice: string | null
          hit_points: number | null
          icon_url: string | null
          id: string
          languages: string | null
          legendary_actions: Json | null
          meta: Json | null
          model_url: string | null
          name: string
          reactions: Json | null
          saves: Json | null
          senses: Json | null
          size: string
          skills: Json | null
          slug: string
          speed: Json | null
          stats: Json
          token_asset_id: string | null
          traits: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          alignment?: string | null
          armor_class?: number | null
          asset_id?: string | null
          cr?: number | null
          created_at?: string
          hit_dice?: string | null
          hit_points?: number | null
          icon_url?: string | null
          id?: string
          languages?: string | null
          legendary_actions?: Json | null
          meta?: Json | null
          model_url?: string | null
          name: string
          reactions?: Json | null
          saves?: Json | null
          senses?: Json | null
          size: string
          skills?: Json | null
          slug: string
          speed?: Json | null
          stats: Json
          token_asset_id?: string | null
          traits?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          alignment?: string | null
          armor_class?: number | null
          asset_id?: string | null
          cr?: number | null
          created_at?: string
          hit_dice?: string | null
          hit_points?: number | null
          icon_url?: string | null
          id?: string
          languages?: string | null
          legendary_actions?: Json | null
          meta?: Json | null
          model_url?: string | null
          name?: string
          reactions?: Json | null
          saves?: Json | null
          senses?: Json | null
          size?: string
          skills?: Json | null
          slug?: string
          speed?: Json | null
          stats?: Json
          token_asset_id?: string | null
          traits?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "srd_creatures_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srd_creatures_token_asset_id_fkey"
            columns: ["token_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      srd_races: {
        Row: {
          ability_bonuses: Json | null
          asset_id: string | null
          created_at: string
          id: string
          languages: string | null
          name: string
          size: string | null
          slug: string
          speed: number | null
          token_asset_id: string | null
          traits: Json | null
          updated_at: string
        }
        Insert: {
          ability_bonuses?: Json | null
          asset_id?: string | null
          created_at?: string
          id?: string
          languages?: string | null
          name: string
          size?: string | null
          slug: string
          speed?: number | null
          token_asset_id?: string | null
          traits?: Json | null
          updated_at?: string
        }
        Update: {
          ability_bonuses?: Json | null
          asset_id?: string | null
          created_at?: string
          id?: string
          languages?: string | null
          name?: string
          size?: string | null
          slug?: string
          speed?: number | null
          token_asset_id?: string | null
          traits?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "srd_races_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srd_races_token_asset_id_fkey"
            columns: ["token_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_asset_categories: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      clear_assets: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_standard_categories: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_monster_image: {
        Args: {
          monster_category: string
          monster_name: string
          prompt_description?: string
        }
        Returns: string
      }
      generate_session_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      import_models_bucket_assets: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_user_dm_of_session: {
        Args: { _session_id: string }
        Returns: boolean
      }
      is_user_participant_of_session: {
        Args: { _session_id: string }
        Returns: boolean
      }
      join_session: {
        Args: {
          character_id_param?: string
          player_name_param: string
          session_code_param: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "dm" | "player"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "dm", "player"],
    },
  },
} as const
