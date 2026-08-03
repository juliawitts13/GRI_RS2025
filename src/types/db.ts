export type StatusIndicador =
  | 'nao_iniciado'
  | 'em_andamento'
  | 'aguardando_validacao'
  | 'concluido'

export type Pilar = 'geral' | 'economico' | 'ambiental' | 'social'

export type Area = {
  id: string
  nome: string
  validador_id: string | null
  created_at: string
}

export type Respondente = {
  id: string
  nome: string
  email: string | null
  area_id: string | null
  ativo: boolean
  eh_respondente: boolean
  eh_validador: boolean
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

export type IndicadorComentario = {
  id: string
  indicador_id: string
  data: string
  texto: string
  criado_em: string
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
      indicador_comentarios: {
        Row: IndicadorComentario
        Insert: Partial<IndicadorComentario> & { indicador_id: string; texto: string }
        Update: Partial<IndicadorComentario>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
