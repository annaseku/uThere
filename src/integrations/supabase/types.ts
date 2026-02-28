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
      group_members: {
        Row: {
          group_id: number
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: number
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: number
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          group_id: number
          invite_code: string
          name: string
          primary_address: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: number
          invite_code?: string
          name: string
          primary_address?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: number
          invite_code?: string
          name?: string
          primary_address?: string | null
        }
        Relationships: []
      }
      place_visibility: {
        Row: {
          group_id: number
          is_visible: boolean | null
          place_id: number
        }
        Insert: {
          group_id: number
          is_visible?: boolean | null
          place_id: number
        }
        Update: {
          group_id?: number
          is_visible?: boolean | null
          place_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "place_visibility_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "place_visibility_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["place_id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          created_at: string | null
          is_default_home: boolean | null
          label: string
          latitude: number
          longitude: number
          place_id: number
          radius_meters: number | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          is_default_home?: boolean | null
          label: string
          latitude: number
          longitude: number
          place_id?: number
          radius_meters?: number | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          is_default_home?: boolean | null
          label?: string
          latitude?: number
          longitude?: number
          place_id?: number
          radius_meters?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_locations: {
        Row: {
          accuracy: number | null
          battery_level: number | null
          latitude: number
          longitude: number
          timestamp: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          battery_level?: number | null
          latitude: number
          longitude: number
          timestamp: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          battery_level?: number | null
          latitude?: number
          longitude?: number
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          color_scheme: string | null
          created_at: string | null
          dark_mode: boolean | null
          device_id: string | null
          email: string | null
          is_sharing_location: boolean | null
          name: string
          notifications_enabled: boolean | null
          phone: string | null
          photo_url: string | null
          user_id: string
        }
        Insert: {
          color_scheme?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          device_id?: string | null
          email?: string | null
          is_sharing_location?: boolean | null
          name: string
          notifications_enabled?: boolean | null
          phone?: string | null
          photo_url?: string | null
          user_id: string
        }
        Update: {
          color_scheme?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          device_id?: string | null
          email?: string | null
          is_sharing_location?: boolean | null
          name?: string
          notifications_enabled?: boolean | null
          phone?: string | null
          photo_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_group_with_admin: {
        Args: { _name: string; _primary_address?: string }
        Returns: number
      }
      is_group_member: {
        Args: { _group_id: number; _user_id: string }
        Returns: boolean
      }
      join_group_by_code: { Args: { _code: string }; Returns: number }
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
