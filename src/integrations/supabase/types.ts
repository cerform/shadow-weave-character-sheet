export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
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
          grid_x: number
          grid_y: number
          id: string
          is_revealed: boolean | null
          map_id: string
          revealed_at: string | null
          revealed_by_user_id: string | null
          session_id: string
        }
        Insert: {
          grid_x: number
          grid_y: number
          id?: string
          is_revealed?: boolean | null
          map_id: string
          revealed_at?: string | null
          revealed_by_user_id?: string | null
          session_id: string
        }
        Update: {
          grid_x?: number
          grid_y?: number
          id?: string
          is_revealed?: boolean | null
          map_id?: string
          revealed_at?: string | null
          revealed_by_user_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fog_of_war_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "battle_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fog_of_war_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_session_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      join_session: {
        Args: {
          session_code_param: string
          player_name_param: string
          character_id_param?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
