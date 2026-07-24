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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comparables: {
        Row: {
          address: string
          created_at: string
          days_on_market: number | null
          id: string
          project_id: string
          sale_date: string | null
          sale_price: number
          sqft_living: number | null
          sqft_total: number | null
        }
        Insert: {
          address: string
          created_at?: string
          days_on_market?: number | null
          id?: string
          project_id: string
          sale_date?: string | null
          sale_price?: number
          sqft_living?: number | null
          sqft_total?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          days_on_market?: number | null
          id?: string
          project_id?: string
          sale_date?: string | null
          sale_price?: number
          sqft_living?: number | null
          sqft_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comparables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          opportunity_id: string | null
          opportunity_name: string | null
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          opportunity_id?: string | null
          opportunity_name?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          opportunity_id?: string | null
          opportunity_name?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          architect: string | null
          bathrooms: number | null
          bedrooms: number | null
          constructor: string | null
          contact_url: string | null
          created_at: string
          expected_roi: number
          garage: string | null
          id: string
          image_url: string | null
          location: string
          model: string | null
          name: string
          sqft_living: number | null
          sqft_total: number | null
          status: string
          study: number | null
          total_investment: number
        }
        Insert: {
          architect?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          constructor?: string | null
          contact_url?: string | null
          created_at?: string
          expected_roi?: number
          garage?: string | null
          id?: string
          image_url?: string | null
          location: string
          model?: string | null
          name: string
          sqft_living?: number | null
          sqft_total?: number | null
          status?: string
          study?: number | null
          total_investment?: number
        }
        Update: {
          architect?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          constructor?: string | null
          contact_url?: string | null
          created_at?: string
          expected_roi?: number
          garage?: string | null
          id?: string
          image_url?: string | null
          location?: string
          model?: string | null
          name?: string
          sqft_living?: number | null
          sqft_total?: number | null
          status?: string
          study?: number | null
          total_investment?: number
        }
        Relationships: []
      }
      portfolio_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          project_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          project_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          project_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          llc_name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          llc_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          llc_name?: string | null
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          category: string
          created_at: string
          doc_type: string
          file_name: string | null
          file_path: string | null
          id: string
          llc_name: string | null
          project_id: string
          uploaded_at: string | null
        }
        Insert: {
          category: string
          created_at?: string
          doc_type: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          llc_name?: string | null
          project_id: string
          uploaded_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          doc_type?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          llc_name?: string | null
          project_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stages: {
        Row: {
          active: boolean
          completed: boolean
          created_at: string
          draw_amount: number | null
          draw_number: number | null
          estimated_date: string | null
          estimated_end_date: string | null
          estimated_start_date: string | null
          id: string
          project_id: string
          stage_group: string | null
          stage_name: string
          stage_order: number
        }
        Insert: {
          active?: boolean
          completed?: boolean
          created_at?: string
          draw_amount?: number | null
          draw_number?: number | null
          estimated_date?: string | null
          estimated_end_date?: string | null
          estimated_start_date?: string | null
          id?: string
          project_id: string
          stage_group?: string | null
          stage_name: string
          stage_order: number
        }
        Update: {
          active?: boolean
          completed?: boolean
          created_at?: string
          draw_amount?: number | null
          draw_number?: number | null
          estimated_date?: string | null
          estimated_end_date?: string | null
          estimated_start_date?: string | null
          id?: string
          project_id?: string
          stage_group?: string | null
          stage_name?: string
          stage_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string
          amount_deposited: number
          bathrooms: number | null
          bedrooms: number | null
          construction_cost: number | null
          created_at: string
          expected_rent_price: number | null
          expected_sale_price: number | null
          features: string | null
          garage: boolean | null
          hero_image_url: string | null
          id: string
          investor_id: string
          lot_cost: number | null
          model_name: string | null
          notes: string | null
          owner_llc: string | null
          owner_llc_2: string | null
          owner_pct_1: number | null
          owner_pct_2: number | null
          sqft_living: number | null
          sqft_total: number | null
          status: string
          total_cost: number | null
          total_value: number
          updated_at: string
        }
        Insert: {
          address: string
          amount_deposited?: number
          bathrooms?: number | null
          bedrooms?: number | null
          construction_cost?: number | null
          created_at?: string
          expected_rent_price?: number | null
          expected_sale_price?: number | null
          features?: string | null
          garage?: boolean | null
          hero_image_url?: string | null
          id?: string
          investor_id: string
          lot_cost?: number | null
          model_name?: string | null
          notes?: string | null
          owner_llc?: string | null
          owner_llc_2?: string | null
          owner_pct_1?: number | null
          owner_pct_2?: number | null
          sqft_living?: number | null
          sqft_total?: number | null
          status?: string
          total_cost?: number | null
          total_value?: number
          updated_at?: string
        }
        Update: {
          address?: string
          amount_deposited?: number
          bathrooms?: number | null
          bedrooms?: number | null
          construction_cost?: number | null
          created_at?: string
          expected_rent_price?: number | null
          expected_sale_price?: number | null
          features?: string | null
          garage?: boolean | null
          hero_image_url?: string | null
          id?: string
          investor_id?: string
          lot_cost?: number | null
          model_name?: string | null
          notes?: string | null
          owner_llc?: string | null
          owner_llc_2?: string | null
          owner_pct_1?: number | null
          owner_pct_2?: number | null
          sqft_living?: number | null
          sqft_total?: number | null
          status?: string
          total_cost?: number | null
          total_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_llc: { Args: never; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_project_documents: {
        Args: { _project_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "investor"
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
      app_role: ["admin", "investor"],
    },
  },
} as const
