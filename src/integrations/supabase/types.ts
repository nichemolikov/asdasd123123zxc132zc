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
      analytics_snapshots: {
        Row: {
          account_id: string
          created_at: string
          engagement_rate: number | null
          followers_count: number | null
          id: string
          posts_count: number | null
          snapshot_date: string
          total_comments: number | null
          total_likes: number | null
        }
        Insert: {
          account_id: string
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          id?: string
          posts_count?: number | null
          snapshot_date?: string
          total_comments?: number | null
          total_likes?: number | null
        }
        Update: {
          account_id?: string
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          id?: string
          posts_count?: number | null
          snapshot_date?: string
          total_comments?: number | null
          total_likes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "instagram_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      best_posting_times: {
        Row: {
          account_id: string
          day_of_week: number
          engagement_score: number | null
          hour_of_day: number
          id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          day_of_week: number
          engagement_score?: number | null
          hour_of_day: number
          id?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          day_of_week?: number
          engagement_score?: number | null
          hour_of_day?: number
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "best_posting_times_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "instagram_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_accounts: {
        Row: {
          access_token: string | null
          avatar_url: string | null
          avg_likes_per_post: number | null
          created_at: string
          engagement_rate: number | null
          followers_count: number | null
          id: string
          instagram_id: string | null
          is_active: boolean | null
          last_synced_at: string | null
          posts_count: number | null
          token_expires_at: string | null
          total_likes: number | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          access_token?: string | null
          avatar_url?: string | null
          avg_likes_per_post?: number | null
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          id?: string
          instagram_id?: string | null
          is_active?: boolean | null
          last_synced_at?: string | null
          posts_count?: number | null
          token_expires_at?: string | null
          total_likes?: number | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          access_token?: string | null
          avatar_url?: string | null
          avg_likes_per_post?: number | null
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          id?: string
          instagram_id?: string | null
          is_active?: boolean | null
          last_synced_at?: string | null
          posts_count?: number | null
          token_expires_at?: string | null
          total_likes?: number | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          account_id: string
          caption: string | null
          comments_count: number | null
          created_at: string
          hashtags: string[] | null
          id: string
          instagram_post_id: string | null
          likes_count: number | null
          media_type: string
          media_urls: string[] | null
          posted_at: string | null
        }
        Insert: {
          account_id: string
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          instagram_post_id?: string | null
          likes_count?: number | null
          media_type?: string
          media_urls?: string[] | null
          posted_at?: string | null
        }
        Update: {
          account_id?: string
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          instagram_post_id?: string | null
          likes_count?: number | null
          media_type?: string
          media_urls?: string[] | null
          posted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "instagram_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          account_id: string
          caption: string | null
          created_at: string
          error_message: string | null
          first_comment: string | null
          hashtags: string[] | null
          id: string
          media_type: string
          media_urls: string[] | null
          published_post_id: string | null
          scheduled_for: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          caption?: string | null
          created_at?: string
          error_message?: string | null
          first_comment?: string | null
          hashtags?: string[] | null
          id?: string
          media_type?: string
          media_urls?: string[] | null
          published_post_id?: string | null
          scheduled_for: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          caption?: string | null
          created_at?: string
          error_message?: string | null
          first_comment?: string | null
          hashtags?: string[] | null
          id?: string
          media_type?: string
          media_urls?: string[] | null
          published_post_id?: string | null
          scheduled_for?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "instagram_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_published_post_id_fkey"
            columns: ["published_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
