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
      locutores: {
        Row: {
          created_at: string
          id: string
          imagem_url: string | null
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          imagem_url?: string | null
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          imagem_url?: string | null
          nome?: string
        }
        Relationships: []
      }
      musicas_recentes: {
        Row: {
          artista: string
          created_at: string
          hora_execucao: string
          id: string
          titulo: string
        }
        Insert: {
          artista: string
          created_at?: string
          hora_execucao: string
          id?: string
          titulo: string
        }
        Update: {
          artista?: string
          created_at?: string
          hora_execucao?: string
          id?: string
          titulo?: string
        }
        Relationships: []
      }
      noticias: {
        Row: {
          conteudo: string | null
          created_at: string
          destaque: boolean
          id: string
          imagem_url: string | null
          link_completo: string | null
          patrocinador_ativo: boolean
          patrocinador_id: string | null
          publicidade_ativa: boolean
          publicidade_id: string | null
          resumo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          destaque?: boolean
          id?: string
          imagem_url?: string | null
          link_completo?: string | null
          patrocinador_ativo?: boolean
          patrocinador_id?: string | null
          publicidade_ativa?: boolean
          publicidade_id?: string | null
          resumo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          destaque?: boolean
          id?: string
          imagem_url?: string | null
          link_completo?: string | null
          patrocinador_ativo?: boolean
          patrocinador_id?: string | null
          publicidade_ativa?: boolean
          publicidade_id?: string | null
          resumo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "noticias_patrocinador_id_fkey"
            columns: ["patrocinador_id"]
            isOneToOne: false
            referencedRelation: "patrocinadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticias_publicidade_id_fkey"
            columns: ["publicidade_id"]
            isOneToOne: false
            referencedRelation: "publicidade_noticias"
            referencedColumns: ["id"]
          },
        ]
      }
      paginas: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          imagem_url: string | null
          slug: string
          titulo: string
          updated_at: string
        }
        Insert: {
          conteudo?: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          slug: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          slug?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      patrocinadores: {
        Row: {
          created_at: string
          id: string
          imagem_url: string | null
          link: string | null
          nome: string
          posicao: string
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          imagem_url?: string | null
          link?: string | null
          nome: string
          posicao?: string
          tipo?: string
        }
        Update: {
          created_at?: string
          id?: string
          imagem_url?: string | null
          link?: string | null
          nome?: string
          posicao?: string
          tipo?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programas: {
        Row: {
          ativo: boolean
          created_at: string
          dias_semana: number[]
          horario_fim: string
          horario_inicio: string
          id: string
          locutor_id: string | null
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          dias_semana?: number[]
          horario_fim: string
          horario_inicio: string
          id?: string
          locutor_id?: string | null
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          dias_semana?: number[]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          locutor_id?: string | null
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "programas_locutor_id_fkey"
            columns: ["locutor_id"]
            isOneToOne: false
            referencedRelation: "locutores"
            referencedColumns: ["id"]
          },
        ]
      }
      publicidade_noticias: {
        Row: {
          ativo: boolean
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          imagem_url: string | null
          link: string | null
          nome: string
          texto: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          nome?: string
          texto?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          nome?: string
          texto?: string | null
        }
        Relationships: []
      }
      radio_config: {
        Row: {
          ads_meio_ativo: boolean
          ads_meio_codigo: string
          ads_rodape_ativo: boolean
          ads_rodape_codigo: string
          ads_topo_ativo: boolean
          ads_topo_codigo: string
          cor_fundo: string
          cor_primaria: string
          cor_secundaria: string
          cor_texto: string
          id: string
          imagem_fundo: string | null
          imagem_fundo_modo: string
          logo_extra: string | null
          logo_extra_posicao: string
          logo_posicao: string
          logo_principal: string | null
          logo_tamanho: number
          musica_atual: string | null
          nome_radio: string
          noticias_posicao: string
          patrocinador_alinhamento: string
          player_posicao: string
          streaming_url: string
          telefone_contato: string
          telefone_link: string
          telefone_posicao: string
          tema: string
          updated_at: string
          visibilidade_destaque: boolean
          visibilidade_logo: boolean
          visibilidade_mapa: boolean
          visibilidade_musicas: boolean
          visibilidade_noticias: boolean
          visibilidade_participacao: boolean
          visibilidade_patrocinadores: boolean
          visibilidade_player: boolean
          visibilidade_premium: boolean
          visibilidade_proximo_programa: boolean
          visibilidade_slides: boolean
          visibilidade_telefone: boolean
          whatsapp_mensagem: string
          whatsapp_numero: string
        }
        Insert: {
          ads_meio_ativo?: boolean
          ads_meio_codigo?: string
          ads_rodape_ativo?: boolean
          ads_rodape_codigo?: string
          ads_topo_ativo?: boolean
          ads_topo_codigo?: string
          cor_fundo?: string
          cor_primaria?: string
          cor_secundaria?: string
          cor_texto?: string
          id?: string
          imagem_fundo?: string | null
          imagem_fundo_modo?: string
          logo_extra?: string | null
          logo_extra_posicao?: string
          logo_posicao?: string
          logo_principal?: string | null
          logo_tamanho?: number
          musica_atual?: string | null
          nome_radio?: string
          noticias_posicao?: string
          patrocinador_alinhamento?: string
          player_posicao?: string
          streaming_url?: string
          telefone_contato?: string
          telefone_link?: string
          telefone_posicao?: string
          tema?: string
          updated_at?: string
          visibilidade_destaque?: boolean
          visibilidade_logo?: boolean
          visibilidade_mapa?: boolean
          visibilidade_musicas?: boolean
          visibilidade_noticias?: boolean
          visibilidade_participacao?: boolean
          visibilidade_patrocinadores?: boolean
          visibilidade_player?: boolean
          visibilidade_premium?: boolean
          visibilidade_proximo_programa?: boolean
          visibilidade_slides?: boolean
          visibilidade_telefone?: boolean
          whatsapp_mensagem?: string
          whatsapp_numero?: string
        }
        Update: {
          ads_meio_ativo?: boolean
          ads_meio_codigo?: string
          ads_rodape_ativo?: boolean
          ads_rodape_codigo?: string
          ads_topo_ativo?: boolean
          ads_topo_codigo?: string
          cor_fundo?: string
          cor_primaria?: string
          cor_secundaria?: string
          cor_texto?: string
          id?: string
          imagem_fundo?: string | null
          imagem_fundo_modo?: string
          logo_extra?: string | null
          logo_extra_posicao?: string
          logo_posicao?: string
          logo_principal?: string | null
          logo_tamanho?: number
          musica_atual?: string | null
          nome_radio?: string
          noticias_posicao?: string
          patrocinador_alinhamento?: string
          player_posicao?: string
          streaming_url?: string
          telefone_contato?: string
          telefone_link?: string
          telefone_posicao?: string
          tema?: string
          updated_at?: string
          visibilidade_destaque?: boolean
          visibilidade_logo?: boolean
          visibilidade_mapa?: boolean
          visibilidade_musicas?: boolean
          visibilidade_noticias?: boolean
          visibilidade_participacao?: boolean
          visibilidade_patrocinadores?: boolean
          visibilidade_player?: boolean
          visibilidade_premium?: boolean
          visibilidade_proximo_programa?: boolean
          visibilidade_slides?: boolean
          visibilidade_telefone?: boolean
          whatsapp_mensagem?: string
          whatsapp_numero?: string
        }
        Relationships: []
      }
      slide_imagens: {
        Row: {
          created_at: string
          id: string
          imagem_url: string
          ordem: number
        }
        Insert: {
          created_at?: string
          id?: string
          imagem_url: string
          ordem?: number
        }
        Update: {
          created_at?: string
          id?: string
          imagem_url?: string
          ordem?: number
        }
        Relationships: []
      }
      social_links: {
        Row: {
          ativo: boolean
          created_at: string
          icone: string
          id: string
          nome: string
          ordem: number
          url: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          icone?: string
          id?: string
          nome: string
          ordem?: number
          url?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          icone?: string
          id?: string
          nome?: string
          ordem?: number
          url?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          id?: string
          permission?: string
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin" | "user"
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
    },
  },
} as const
