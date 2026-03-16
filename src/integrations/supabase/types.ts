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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_messages: {
        Row: {
          created_at: string | null
          id: string
          is_broadcast: boolean | null
          is_read: boolean | null
          message: string
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_broadcast?: boolean | null
          is_read?: boolean | null
          message: string
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_broadcast?: boolean | null
          is_read?: boolean | null
          message?: string
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: []
      }
      channels: {
        Row: {
          created_at: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          language: string | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          language?: string | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          language?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fertilizer_prices: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
          subsidy: boolean
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price: number
          subsidy?: boolean
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
          subsidy?: boolean
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          commodity: string
          created_at: string
          date: string
          id: string
          market: string
          max_price: number
          min_price: number
          modal_price: number
          state: string
          trend: string | null
          unit: string
          updated_at: string
          variety: string
        }
        Insert: {
          commodity: string
          created_at?: string
          date?: string
          id?: string
          market: string
          max_price: number
          min_price: number
          modal_price: number
          state: string
          trend?: string | null
          unit?: string
          updated_at?: string
          variety: string
        }
        Update: {
          commodity?: string
          created_at?: string
          date?: string
          id?: string
          market?: string
          max_price?: number
          min_price?: number
          modal_price?: number
          state?: string
          trend?: string | null
          unit?: string
          updated_at?: string
          variety?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          channel_id: number
          created_at: string | null
          file_url: string | null
          id: number
          is_ai_message: boolean | null
          is_flagged: boolean | null
          message: string
          profile_id: string | null
          user_id: string
        }
        Insert: {
          channel_id: number
          created_at?: string | null
          file_url?: string | null
          id?: number
          is_ai_message?: boolean | null
          is_flagged?: boolean | null
          message: string
          profile_id?: string | null
          user_id: string
        }
        Update: {
          channel_id?: number
          created_at?: string | null
          file_url?: string | null
          id?: number
          is_ai_message?: boolean | null
          is_flagged?: boolean | null
          message?: string
          profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          created_at: string | null
          id: string
          is_reviewed: boolean | null
          message: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_reviewed?: boolean | null
          message: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_reviewed?: boolean | null
          message?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          id: string
          payment_date: string | null
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          transaction_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          transaction_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          transaction_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      soil_checks: {
        Row: {
          contact_phone: string | null
          created_at: string
          farm_area_acres: number | null
          id: string
          location: string | null
          moisture_percent: number | null
          nitrogen_level: string | null
          notes: string | null
          organic_matter_percent: number | null
          ph_level: number | null
          phosphorus_level: string | null
          potassium_level: string | null
          primary_crop: string | null
          recommendations: string | null
          sample_count: number | null
          soil_type: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          farm_area_acres?: number | null
          id?: string
          location?: string | null
          moisture_percent?: number | null
          nitrogen_level?: string | null
          notes?: string | null
          organic_matter_percent?: number | null
          ph_level?: number | null
          phosphorus_level?: string | null
          potassium_level?: string | null
          primary_crop?: string | null
          recommendations?: string | null
          sample_count?: number | null
          soil_type?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          farm_area_acres?: number | null
          id?: string
          location?: string | null
          moisture_percent?: number | null
          nitrogen_level?: string | null
          notes?: string | null
          organic_matter_percent?: number | null
          ph_level?: number | null
          phosphorus_level?: string | null
          potassium_level?: string | null
          primary_crop?: string | null
          recommendations?: string | null
          sample_count?: number | null
          soil_type?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tool_bookings: {
        Row: {
          contact_phone: string | null
          created_at: string
          delivery_address: string | null
          end_date: string
          id: string
          rejection_reason: string | null
          rental_type: string
          start_date: string
          status: string | null
          tool_id: string
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          delivery_address?: string | null
          end_date: string
          id?: string
          rejection_reason?: string | null
          rental_type: string
          start_date: string
          status?: string | null
          tool_id: string
          total_cost: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          delivery_address?: string | null
          end_date?: string
          id?: string
          rejection_reason?: string | null
          rental_type?: string
          start_date?: string
          status?: string | null
          tool_id?: string
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_bookings_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          availability: boolean | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string | null
          name: string
          owner_id: string
          price_per_day: number
          price_per_month: number
          price_per_season: number
          updated_at: string
        }
        Insert: {
          availability?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          name: string
          owner_id: string
          price_per_day: number
          price_per_month: number
          price_per_season: number
          updated_at?: string
        }
        Update: {
          availability?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          name?: string
          owner_id?: string
          price_per_day?: number
          price_per_month?: number
          price_per_season?: number
          updated_at?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      warehouse_bookings: {
        Row: {
          contact_phone: string | null
          created_at: string
          end_date: string
          id: string
          notes: string | null
          rejection_reason: string | null
          space_sqft: number
          start_date: string
          status: string | null
          total_cost: number
          updated_at: string
          user_id: string
          warehouse_storage_option_id: string | null
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          space_sqft?: number
          start_date: string
          status?: string | null
          total_cost: number
          updated_at?: string
          user_id: string
          warehouse_storage_option_id?: string | null
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          space_sqft?: number
          start_date?: string
          status?: string | null
          total_cost?: number
          updated_at?: string
          user_id?: string
          warehouse_storage_option_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_bookings_warehouse_storage_option_id_fkey"
            columns: ["warehouse_storage_option_id"]
            isOneToOne: false
            referencedRelation: "warehouse_storage_options"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_storage_options: {
        Row: {
          id: string
          max_custom_space_sqft: number | null
          min_custom_space_sqft: number | null
          price_per_sqft_day: number
          price_per_sqft_month: number
          size_category: Database["public"]["Enums"]["size_category"]
          space_sqft: number | null
          storage_type: Database["public"]["Enums"]["storage_type"]
          warehouse_id: string
        }
        Insert: {
          id?: string
          max_custom_space_sqft?: number | null
          min_custom_space_sqft?: number | null
          price_per_sqft_day: number
          price_per_sqft_month: number
          size_category: Database["public"]["Enums"]["size_category"]
          space_sqft?: number | null
          storage_type: Database["public"]["Enums"]["storage_type"]
          warehouse_id: string
        }
        Update: {
          id?: string
          max_custom_space_sqft?: number | null
          min_custom_space_sqft?: number | null
          price_per_sqft_day?: number
          price_per_sqft_month?: number
          size_category?: Database["public"]["Enums"]["size_category"]
          space_sqft?: number | null
          storage_type?: Database["public"]["Enums"]["storage_type"]
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_storage_options_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          availability: boolean
          available_space_sqft: number
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string
          name: string
          owner_id: string
          total_space_sqft: number
          updated_at: string
        }
        Insert: {
          availability?: boolean
          available_space_sqft?: number
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location: string
          name: string
          owner_id: string
          total_space_sqft?: number
          updated_at?: string
        }
        Update: {
          availability?: boolean
          available_space_sqft?: number
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string
          name?: string
          owner_id?: string
          total_space_sqft?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      payment_history_view: {
        Row: {
          amount: number | null
          booked_sqft: number | null
          booking_id: string | null
          created_at: string | null
          id: string | null
          item_name: string | null
          payment_date: string | null
          payment_status: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          transaction_id: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_profile_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { user_id: string }; Returns: boolean }
      match_documents: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_knowledge_base: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "farmer" | "admin"
      size_category: "small" | "medium" | "large" | "custom"
      storage_type: "normal" | "cold" | "hot"
      user_role: "farmer" | "admin"
      warehouse_category:
        | "Cold Storage"
        | "Dry Storage"
        | "Refrigerated Containers"
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
      app_role: ["farmer", "admin"],
      size_category: ["small", "medium", "large", "custom"],
      storage_type: ["normal", "cold", "hot"],
      user_role: ["farmer", "admin"],
      warehouse_category: [
        "Cold Storage",
        "Dry Storage",
        "Refrigerated Containers",
      ],
    },
  },
} as const
