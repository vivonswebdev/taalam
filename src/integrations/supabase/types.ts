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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_name: string | null
          author_uid: string
          class_code: string
          created_at: string
          id: string
          message: string
          title: string
        }
        Insert: {
          author_name?: string | null
          author_uid: string
          class_code: string
          created_at?: string
          id?: string
          message: string
          title: string
        }
        Update: {
          author_name?: string | null
          author_uid?: string
          class_code?: string
          created_at?: string
          id?: string
          message?: string
          title?: string
        }
        Relationships: []
      }
      class_challenge_results: {
        Row: {
          challenge_id: string
          class_id: string
          completed_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          class_id: string
          completed_at?: string
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          class_id?: string
          completed_at?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_challenge_results_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "class_weekly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_challenge_results_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      class_messages: {
        Row: {
          author_id: string
          author_name: string
          classroom_id: string
          created_at: string
          id: string
          message: string
        }
        Insert: {
          author_id: string
          author_name: string
          classroom_id: string
          created_at?: string
          id?: string
          message: string
        }
        Update: {
          author_id?: string
          author_name?: string
          classroom_id?: string
          created_at?: string
          id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_messages_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      class_weekly_challenges: {
        Row: {
          ayah_from: number
          ayah_to: number
          class_id: string
          created_at: string
          created_by: string
          double_xp: boolean
          id: string
          surah_number: number
          week_start: string
        }
        Insert: {
          ayah_from: number
          ayah_to: number
          class_id: string
          created_at?: string
          created_by: string
          double_xp?: boolean
          id?: string
          surah_number: number
          week_start: string
        }
        Update: {
          ayah_from?: number
          ayah_to?: number
          class_id?: string
          created_at?: string
          created_by?: string
          double_xp?: boolean
          id?: string
          surah_number?: number
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_weekly_challenges_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_members: {
        Row: {
          classroom_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          classroom_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          classroom_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_members_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          created_at: string
          id: string
          join_code: string
          name: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          join_code: string
          name: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          join_code?: string
          name?: string
          teacher_id?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string
          family_id: string
          id: string
          role_in_family: string
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          role_in_family?: string
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          role_in_family?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_notifications: {
        Row: {
          created_at: string
          family_id: string
          from_user_id: string
          id: string
          payload: Json
          read_at: string | null
          to_user_id: string
          type: string
        }
        Insert: {
          created_at?: string
          family_id: string
          from_user_id: string
          id?: string
          payload?: Json
          read_at?: string | null
          to_user_id: string
          type: string
        }
        Update: {
          created_at?: string
          family_id?: string
          from_user_id?: string
          id?: string
          payload?: Json
          read_at?: string | null
          to_user_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_notifications_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      listening_sessions: {
        Row: {
          created_at: string
          end_at: string | null
          id: string
          listened_full: boolean
          source: string
          start_at: string
          surah_number: number
          user_id: string
        }
        Insert: {
          created_at?: string
          end_at?: string | null
          id?: string
          listened_full?: boolean
          source?: string
          start_at?: string
          surah_number: number
          user_id: string
        }
        Update: {
          created_at?: string
          end_at?: string | null
          id?: string
          listened_full?: boolean
          source?: string
          start_at?: string
          surah_number?: number
          user_id?: string
        }
        Relationships: []
      }
      perfect_challenge_scores: {
        Row: {
          best_score: number
          challenge_id: string
          id: string
          plays: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_score?: number
          challenge_id: string
          id?: string
          plays?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_score?: number
          challenge_id?: string
          id?: string
          plays?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfect_challenge_scores_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "perfect_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      perfect_challenges: {
        Row: {
          created_at: string
          end_at: string
          id: string
          start_at: string
          type: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          start_at: string
          type?: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          start_at?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_emoji: string
          country_code: string | null
          created_at: string
          display_name: string
          id: string
          is_public: boolean
          mastery_score: number
          sessions_count: number
          updated_at: string
          user_id: string
          xp_total: number
        }
        Insert: {
          avatar_emoji?: string
          country_code?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_public?: boolean
          mastery_score?: number
          sessions_count?: number
          updated_at?: string
          user_id: string
          xp_total?: number
        }
        Update: {
          avatar_emoji?: string
          country_code?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_public?: boolean
          mastery_score?: number
          sessions_count?: number
          updated_at?: string
          user_id?: string
          xp_total?: number
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string
          last_xp_date: string | null
          streak_days: number
          updated_at: string
          user_id: string
          xp_today: number
          xp_total: number
        }
        Insert: {
          created_at?: string
          last_xp_date?: string | null
          streak_days?: number
          updated_at?: string
          user_id: string
          xp_today?: number
          xp_total?: number
        }
        Update: {
          created_at?: string
          last_xp_date?: string | null
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp_today?: number
          xp_total?: number
        }
        Relationships: []
      }
      weak_surahs: {
        Row: {
          id: string
          last_updated_at: string
          surah_number: number
          user_id: string
          weakness_score: number
        }
        Insert: {
          id?: string
          last_updated_at?: string
          surah_number: number
          user_id: string
          weakness_score?: number
        }
        Update: {
          id?: string
          last_updated_at?: string
          surah_number?: number
          user_id?: string
          weakness_score?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_classroom_member: {
        Args: { _classroom_id: string; _user_id: string }
        Returns: boolean
      }
      is_classroom_teacher: {
        Args: { _classroom_id: string; _user_id: string }
        Returns: boolean
      }
      is_family_member: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
      is_family_parent: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
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
