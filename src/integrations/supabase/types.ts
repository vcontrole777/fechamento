export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          updated_at: string
        }
        Insert: {
          id: string
          id_equipe?: number | null
          nome?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          id_equipe?: number | null
          nome?: string | null
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
          conta_depositada: string | null
          criado_em: string
          data: string
          id: number
          id_equipe: number
          id_tripeiro: number
          numero_comprovante: string | null
          observacoes: string | null
          tipo_deposito: string | null
          valor: number
        }
        Insert: {
          atualizado_em?: string
          banco?: string | null
          conta_depositada?: string | null
          criado_em?: string
          data: string
          id?: number
          id_equipe: number
          id_tripeiro: number
          numero_comprovante?: string | null
          observacoes?: string | null
          tipo_deposito?: string | null
          valor: number
        }
        Update: {
          atualizado_em?: string
          banco?: string | null
          conta_depositada?: string | null
          criado_em?: string
          data?: string
          id?: number
          id_equipe?: number
          id_tripeiro?: number
          numero_comprovante?: string | null
          observacoes?: string | null
          tipo_deposito?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "recebimentos_id_equipe_fkey"
            columns: ["id_equipe"]
            isOneToOne: false
            referencedRelation: "equipes"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_equipe_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      status_pagamento: "concluido" | "pendente" | "bloqueado"
      tipo_pagamento: "boleto" | "pix"
      tipo_pessoa: "atendente" | "tripeiro" | "responsavel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      status_pagamento: ["concluido", "pendente", "bloqueado"],
      tipo_pagamento: ["boleto", "pix"],
      tipo_pessoa: ["atendente", "tripeiro", "responsavel"],
    },
  },
} as const
