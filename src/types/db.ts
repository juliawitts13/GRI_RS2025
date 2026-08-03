export type StatusIndicador =
  | 'nao_iniciado'
  | 'em_andamento'
  | 'aguardando_validacao'
  | 'concluido'

export type Pilar = 'geral' | 'economico' | 'ambiental' | 'social'

export type Area = {
  id: string
  nome: string
  created_at: string
}

export type Respondente = {
  id: string
  nome: string
  email: string | null
  area_id: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export type Indicador = {
  id: string
  codigo_gri: string
  titulo: string
  pilar: Pilar
  area_id: string | null
  respondente_id: string | null
  status: StatusIndicador
  prazo: string | null
  ficha_conteudo: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      areas: {
        Row: Area
        Insert: Partial<Area> & { nome: string }
        Update: Partial<Area>
        Relationships: []
      }
      respondentes: {
        Row: Respondente
        Insert: Partial<Respondente> & { nome: string }
        Update: Partial<Respondente>
        Relationships: []
      }
      indicadores: {
        Row: Indicador
        Insert: Partial<Indicador> & { codigo_gri: string; titulo: string }
        Update: Partial<Indicador>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
