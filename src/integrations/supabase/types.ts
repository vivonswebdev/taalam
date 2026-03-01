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
      admin_settings: {
        Row: {
          hide_announcement: boolean
          hide_daily_challenge: boolean
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          hide_announcement?: boolean
          hide_daily_challenge?: boolean
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          hide_announcement?: boolean
          hide_daily_challenge?: boolean
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
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
      app_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          module: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          module: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          module?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      asr_logs: {
        Row: {
          ayah_number: number | null
          cer_score: number | null
          confidence_score: number | null
          created_at: string
          device_info: string | null
          duration_ms: number | null
          expected_text: string | null
          id: string
          is_correct: boolean | null
          mode: string
          recognized_text: string | null
          report_reason: string | null
          reported_by_user: boolean | null
          scoring_mode: string | null
          session_id: string | null
          surah_number: number | null
          user_id: string | null
          voice_profile: string | null
          volume_avg: number | null
          volume_peak: number | null
          wer_score: number | null
        }
        Insert: {
          ayah_number?: number | null
          cer_score?: number | null
          confidence_score?: number | null
          created_at?: string
          device_info?: string | null
          duration_ms?: number | null
          expected_text?: string | null
          id?: string
          is_correct?: boolean | null
          mode?: string
          recognized_text?: string | null
          report_reason?: string | null
          reported_by_user?: boolean | null
          scoring_mode?: string | null
          session_id?: string | null
          surah_number?: number | null
          user_id?: string | null
          voice_profile?: string | null
          volume_avg?: number | null
          volume_peak?: number | null
          wer_score?: number | null
        }
        Update: {
          ayah_number?: number | null
          cer_score?: number | null
          confidence_score?: number | null
          created_at?: string
          device_info?: string | null
          duration_ms?: number | null
          expected_text?: string | null
          id?: string
          is_correct?: boolean | null
          mode?: string
          recognized_text?: string | null
          report_reason?: string | null
          reported_by_user?: boolean | null
          scoring_mode?: string | null
          session_id?: string | null
          surah_number?: number | null
          user_id?: string | null
          voice_profile?: string | null
          volume_avg?: number | null
          volume_peak?: number | null
          wer_score?: number | null
        }
        Relationships: []
      }
      ayah_favorites: {
        Row: {
          ayah_number: number
          created_at: string
          id: string
          surah_number: number
          user_id: string
        }
        Insert: {
          ayah_number: number
          created_at?: string
          id?: string
          surah_number: number
          user_id: string
        }
        Update: {
          ayah_number?: number
          created_at?: string
          id?: string
          surah_number?: number
          user_id?: string
        }
        Relationships: []
      }
      ayah_notes: {
        Row: {
          ayah_number: number
          content: string
          created_at: string
          id: string
          is_shared: boolean
          shared_to_class_id: string | null
          shared_to_family_id: string | null
          surah_number: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ayah_number: number
          content?: string
          created_at?: string
          id?: string
          is_shared?: boolean
          shared_to_class_id?: string | null
          shared_to_family_id?: string | null
          surah_number: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ayah_number?: number
          content?: string
          created_at?: string
          id?: string
          is_shared?: boolean
          shared_to_class_id?: string | null
          shared_to_family_id?: string | null
          surah_number?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ayah_notes_shared_to_class_id_fkey"
            columns: ["shared_to_class_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ayah_notes_shared_to_family_id_fkey"
            columns: ["shared_to_family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      class_assignments: {
        Row: {
          class_id: string
          created_at: string
          created_by: string
          due_date: string
          id: string
          is_active: boolean
          target: Json
          title: string
          type: string
        }
        Insert: {
          class_id: string
          created_at?: string
          created_by: string
          due_date: string
          id?: string
          is_active?: boolean
          target?: Json
          title: string
          type?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          created_by?: string
          due_date?: string
          id?: string
          is_active?: boolean
          target?: Json
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
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
      communities: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          language: string | null
          name: string
          region: string | null
          requires_approval: boolean | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          language?: string | null
          name: string
          region?: string | null
          requires_approval?: boolean | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          language?: string | null
          name?: string
          region?: string | null
          requires_approval?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      community_join_requests: {
        Row: {
          community_id: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_join_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          author_name: string
          community_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          message_type: string
          user_id: string
        }
        Insert: {
          author_name?: string
          community_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          message_type?: string
          user_id: string
        }
        Update: {
          author_name?: string
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          message_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      crush_scores: {
        Row: {
          avatar_emoji: string
          created_at: string
          display_name: string
          high_score: number
          id: string
          level: number
          max_combo: number
          total_cleared: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_emoji?: string
          created_at?: string
          display_name?: string
          high_score?: number
          id?: string
          level?: number
          max_combo?: number
          total_cleared?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_emoji?: string
          created_at?: string
          display_name?: string
          high_score?: number
          id?: string
          level?: number
          max_combo?: number
          total_cleared?: number
          updated_at?: string
          user_id?: string
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
      fcm_tokens: {
        Row: {
          created_at: string
          device_info: string | null
          id: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          id?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          id?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hifz_items: {
        Row: {
          ayah_from: number
          ayah_to: number
          created_at: string
          ease_factor: number
          id: string
          interval_days: number
          last_quality: number | null
          last_reviewed_at: string | null
          next_review_date: string
          repetitions: number
          status: string
          surah_number: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ayah_from: number
          ayah_to: number
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_quality?: number | null
          last_reviewed_at?: string | null
          next_review_date?: string
          repetitions?: number
          status?: string
          surah_number: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ayah_from?: number
          ayah_to?: number
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_quality?: number | null
          last_reviewed_at?: string | null
          next_review_date?: string
          repetitions?: number
          status?: string
          surah_number?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hifz_plan_tasks: {
        Row: {
          ayah_from: number
          ayah_to: number
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          plan_id: string
          surah_number: number
          task_date: string
          task_type: string
          user_id: string
        }
        Insert: {
          ayah_from: number
          ayah_to: number
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          plan_id: string
          surah_number: number
          task_date: string
          task_type?: string
          user_id: string
        }
        Update: {
          ayah_from?: number
          ayah_to?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          plan_id?: string
          surah_number?: number
          task_date?: string
          task_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hifz_plan_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "hifz_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      hifz_plans: {
        Row: {
          created_at: string
          daily_ayat: number
          duration_days: number
          id: string
          is_active: boolean
          name: string
          started_at: string
          target_items: Json
          target_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_ayat?: number
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          started_at?: string
          target_items?: Json
          target_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_ayat?: number
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          started_at?: string
          target_items?: Json
          target_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listening_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          end_at: string | null
          from_ayah: number | null
          has_quiz: boolean | null
          id: string
          listened_full: boolean
          quiz_score: number | null
          source: string
          start_at: string
          surah_number: number
          to_ayah: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          end_at?: string | null
          from_ayah?: number | null
          has_quiz?: boolean | null
          id?: string
          listened_full?: boolean
          quiz_score?: number | null
          source?: string
          start_at?: string
          surah_number: number
          to_ayah?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          end_at?: string | null
          from_ayah?: number | null
          has_quiz?: boolean | null
          id?: string
          listened_full?: boolean
          quiz_score?: number | null
          source?: string
          start_at?: string
          surah_number?: number
          to_ayah?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mushaf_bookmarks: {
        Row: {
          ayah_key: string | null
          created_at: string | null
          id: string
          note: string | null
          page_number: number
          surah_number: number | null
          user_id: string
        }
        Insert: {
          ayah_key?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          page_number: number
          surah_number?: number | null
          user_id: string
        }
        Update: {
          ayah_key?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          page_number?: number
          surah_number?: number | null
          user_id?: string
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          body: string
          id: string
          opened_at: string | null
          sent_at: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string
          id?: string
          opened_at?: string | null
          sent_at?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          id?: string
          opened_at?: string | null
          sent_at?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          assignment_reminder: boolean
          created_at: string
          hifz_reminder: boolean
          id: string
          nudge_after_days: number
          nudge_enabled: boolean
          reminder_hour: number
          reminder_minute: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_reminder?: boolean
          created_at?: string
          hifz_reminder?: boolean
          id?: string
          nudge_after_days?: number
          nudge_enabled?: boolean
          reminder_hour?: number
          reminder_minute?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_reminder?: boolean
          created_at?: string
          hifz_reminder?: boolean
          id?: string
          nudge_after_days?: number
          nudge_enabled?: boolean
          reminder_hour?: number
          reminder_minute?: number
          updated_at?: string
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
          age_group: string
          avatar_emoji: string
          country_code: string | null
          created_at: string
          display_name: string
          id: string
          is_public: boolean
          mastery_score: number
          preferred_mode: string
          sessions_count: number
          updated_at: string
          user_id: string
          xp_total: number
        }
        Insert: {
          age_group?: string
          avatar_emoji?: string
          country_code?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_public?: boolean
          mastery_score?: number
          preferred_mode?: string
          sessions_count?: number
          updated_at?: string
          user_id: string
          xp_total?: number
        }
        Update: {
          age_group?: string
          avatar_emoji?: string
          country_code?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_public?: boolean
          mastery_score?: number
          preferred_mode?: string
          sessions_count?: number
          updated_at?: string
          user_id?: string
          xp_total?: number
        }
        Relationships: []
      }
      question_stats: {
        Row: {
          correct: number
          id: string
          last_seen_at: string
          question_id: string
          seen: number
          user_id: string
        }
        Insert: {
          correct?: number
          id?: string
          last_seen_at?: string
          question_id: string
          seen?: number
          user_id: string
        }
        Update: {
          correct?: number
          id?: string
          last_seen_at?: string
          question_id?: string
          seen?: number
          user_id?: string
        }
        Relationships: []
      }
      quran_daily_activity: {
        Row: {
          activity_date: string
          ayat_recited: number
          created_at: string
          id: string
          minutes_quran: number
          sessions_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          ayat_recited?: number
          created_at?: string
          id?: string
          minutes_quran?: number
          sessions_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          ayat_recited?: number
          created_at?: string
          id?: string
          minutes_quran?: number
          sessions_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_xp: {
        Row: {
          last_reason: string | null
          updated_at: string
          user_id: string
          xp_total: number
        }
        Insert: {
          last_reason?: string | null
          updated_at?: string
          user_id: string
          xp_total?: number
        }
        Update: {
          last_reason?: string | null
          updated_at?: string
          user_id?: string
          xp_total?: number
        }
        Relationships: []
      }
      sheytan_game_scores: {
        Row: {
          created_at: string
          id: string
          level: number
          player_name: string
          score: number
          user_id: string | null
          verses_collected: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          player_name?: string
          score?: number
          user_id?: string | null
          verses_collected?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          player_name?: string
          score?: number
          user_id?: string | null
          verses_collected?: string[] | null
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          assignment_id: string
          audio_url: string | null
          class_id: string
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          score_tajwid: number | null
          status: string
          student_id: string
          teacher_note: string | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          audio_url?: string | null
          class_id: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score_tajwid?: number | null
          status?: string
          student_id: string
          teacher_note?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          audio_url?: string | null
          class_id?: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score_tajwid?: number | null
          status?: string
          student_id?: string
          teacher_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "class_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_class_teacher: {
        Args: { _class_code: string; _user_id: string }
        Returns: boolean
      }
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
      lookup_classroom_by_code: {
        Args: { _join_code: string }
        Returns: {
          id: string
          join_code: string
          name: string
          teacher_id: string
        }[]
      }
      lookup_family_by_code: {
        Args: { _invite_code: string }
        Returns: {
          created_by: string
          id: string
          invite_code: string
          name: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
