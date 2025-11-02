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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      contas_bancarias: {
        Row: {
          agencia: string
          atualizado_em: string
          banco: string
          conta: string
          criado_em: string
          id: number
          id_equipe: number
          titular: string | null
        }
        Insert: {
          agencia: string
          atualizado_em?: string
          banco: string
          conta: string
          criado_em?: string
          id?: number
          id_equipe: number
          titular?: string | null
        }
        Update: {
          agencia?: string
          atualizado_em?: string
          banco?: string
          conta?: string
          criado_em?: string
          id?: number
          id_equipe?: number
          titular?: string | null
        }
        Relationships: []
      }
      despesas: {
        Row: {
          criado_em: string
          data: string
          descricao: string
          id: number
          id_equipe: number
          id_responsavel: number | null
          valor: number
        }
        Insert: {
          criado_em?: string
          data: string
          descricao: string
          id?: number
          id_equipe: number
          id_responsavel?: number | null
          valor: number
        }
        Update: {
          criado_em?: string
          data?: string
          descricao?: string
          id?: number
          id_equipe?: number
          id_responsavel?: number | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_id_equipe_fkey"
            columns: ["id_equipe"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_id_responsavel_fkey"
            columns: ["id_responsavel"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes: {
        Row: {
          criado_em: string
          id: number
          nome: string
        }
        Insert: {
          criado_em?: string
          id?: number
          nome: string
        }
        Update: {
          criado_em?: string
          id?: number
          nome?: string
        }
        Relationships: []
      }
      notes_and_reminders: {
        Row: {
          completed: boolean
          content: string | null
          created_at: string
          date: string
          id: string
          is_reminder: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          content?: string | null
          created_at?: string
          date: string
          id?: string
          is_reminder?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          content?: string | null
          created_at?: string
          date?: string
          id?: string
          is_reminder?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          criado_em: string
          data: string
          id: number
          id_atendente: number | null
          id_equipe: number
          id_tripeiro: number | null
          porcentagem_atendente: number
          porcentagem_tripeiro: number
          status: Database["public"]["Enums"]["status_pagamento"]
          tipo: Database["public"]["Enums"]["tipo_pagamento"]
          valor: number
        }
        Insert: {
          criado_em?: string
          data: string
          id?: number
          id_atendente?: number | null
          id_equipe: number
          id_tripeiro?: number | null
          porcentagem_atendente?: number
          porcentagem_tripeiro?: number
          status?: Database["public"]["Enums"]["status_pagamento"]
          tipo: Database["public"]["Enums"]["tipo_pagamento"]
          valor: number
        }
        Update: {
          criado_em?: string
          data?: string
          id?: number
          id_atendente?: number | null
          id_equipe?: number
          id_tripeiro?: number | null
          porcentagem_atendente?: number
          porcentagem_tripeiro?: number
          status?: Database["public"]["Enums"]["status_pagamento"]
          tipo?: Database["public"]["Enums"]["tipo_pagamento"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_id_atendente_fkey"
            columns: ["id_atendente"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_id_equipe_fkey"
            columns: ["id_equipe"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_id_tripeiro_fkey"
            columns: ["id_tripeiro"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          criado_em: string
          id: number
          id_equipe: number
          id_usuario: string | null
          nome: string
          porcentagem: number | null
          tipo: Database["public"]["Enums"]["tipo_pessoa"]
        }
        Insert: {
          criado_em?: string
          id?: number
          id_equipe: number
          id_usuario?: string | null
          nome: string
          porcentagem?: number | null
          tipo: Database["public"]["Enums"]["tipo_pessoa"]
        }
        Update: {
          criado_em?: string
          id?: number
          id_equipe?: number
          id_usuario?: string | null
          nome?: string
          porcentagem?: number | null
          tipo?: Database["public"]["Enums"]["tipo_pessoa"]
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_id_equipe_fkey"
            columns: ["id_equipe"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          id_equipe: number | null
          nome: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          id: string
          id_equipe?: number | null
          nome?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          id?: string
          id_equipe?: number | null
          nome?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_equipe_fkey"
            columns: ["id_equipe"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recebimentos: {
        Row: {
          atualizado_em: string
          banco: string | null
          criado_em: string
          data: string
          id: number
          id_conta_bancaria: number | null
          id_equipe: number
          id_responsavel: number | null
          id_tripeiro: number
          observacoes: string | null
          tipo_deposito: string | null
          valor: number
        }
        Insert: {
          atualizado_em?: string
          banco?: string | null
          criado_em?: string
          data: string
          id?: number
          id_conta_bancaria?: number | null
          id_equipe: number
          id_responsavel?: number | null
          id_tripeiro: number
          observacoes?: string | null
          tipo_deposito?: string | null
          valor: number
        }
        Update: {
          atualizado_em?: string
          banco?: string | null
          criado_em?: string
          data?: string
          id?: number
          id_conta_bancaria?: number | null
          id_equipe?: number
          id_responsavel?: number | null
          id_tripeiro?: number
          observacoes?: string | null
          tipo_deposito?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_recebimentos_conta_bancaria"
            columns: ["id_conta_bancaria"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recebimentos_id_equipe_fkey"
            columns: ["id_equipe"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recebimentos_id_responsavel_fkey"
            columns: ["id_responsavel"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recebimentos_id_tripeiro_fkey"
            columns: ["id_tripeiro"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      system_notifications: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          message: string
          priority: number | null
          start_date: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          message: string
          priority?: number | null
          start_date?: string | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          message?: string
          priority?: number | null
          start_date?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "system_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
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
      get_user_equipe_id: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      limpar_dados_equipe: { Args: { equipe_id: number }; Returns: undefined }
      make_user_admin: { Args: { user_email: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      status_pagamento: "concluido" | "pendente" | "bloqueado"
      tipo_pagamento: "boleto" | "pix" | "link"
      tipo_pessoa: "atendente" | "tripeiro" | "responsavel"
      user_role: "admin" | "user"
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
      app_role: ["admin", "user"],
      status_pagamento: ["concluido", "pendente", "bloqueado"],
      tipo_pagamento: ["boleto", "pix", "link"],
      tipo_pessoa: ["atendente", "tripeiro", "responsavel"],
      user_role: ["admin", "user"],
    },
  },
} as const
