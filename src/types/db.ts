export type StatusIndicador =
  | 'nao_iniciado'
  | 'em_andamento'
  | 'aguardando_validacao'
  | 'devolvido_area'
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
  status: StatusIndicador
  prazo: string | null
  expectativa_entrega: string | null
  vencimento: string | null
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

export type IndicadorRespondente = {
  id: string
  indicador_id: string
  respondente_id: string
  created_at: string
}

export type IndicadorPergunta = {
  id: string
  indicador_id: string
  texto: string
  respondida: boolean
  ordem: number | null
  created_at: string
}

export type Capitulo = {
  id: string
  nome: string
  ordem: number | null
  created_at: string
}

export type IndicadorCapitulo = {
  id: string
  indicador_id: string
  capitulo_id: string
  created_at: string
}

export type TemaMaterial = {
  id: string
  nome: string
  descricao: string | null
  created_at: string
}

export type IndicadorTemaMaterial = {
  id: string
  indicador_id: string
  tema_material_id: string
  created_at: string
}

export type CapituloTemaMaterial = {
  id: string
  capitulo_id: string
  tema_material_id: string
  created_at: string
}

export type CapituloTopico = {
  id: string
  capitulo_id: string
  texto: string
  ordem: number | null
  created_at: string
}

export type Ods = {
  id: number
  numero: number
  nome: string
}

export type TemaMaterialOds = {
  id: string
  tema_material_id: string
  ods_id: number
  created_at: string
}

export type StatusProjeto = 'nao_iniciado' | 'em_andamento' | 'concluido'

export type Projeto = {
  id: string
  tema_material_id: string
  nome: string
  status: StatusProjeto
  descricao: string | null
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
      indicador_comentarios: {
        Row: IndicadorComentario
        Insert: Partial<IndicadorComentario> & { indicador_id: string; texto: string }
        Update: Partial<IndicadorComentario>
        Relationships: []
      }
      indicador_respondentes: {
        Row: IndicadorRespondente
        Insert: Partial<IndicadorRespondente> & { indicador_id: string; respondente_id: string }
        Update: Partial<IndicadorRespondente>
        Relationships: []
      }
      indicador_perguntas: {
        Row: IndicadorPergunta
        Insert: Partial<IndicadorPergunta> & { indicador_id: string; texto: string }
        Update: Partial<IndicadorPergunta>
        Relationships: []
      }
      capitulos: {
        Row: Capitulo
        Insert: Partial<Capitulo> & { nome: string }
        Update: Partial<Capitulo>
        Relationships: []
      }
      indicador_capitulos: {
        Row: IndicadorCapitulo
        Insert: Partial<IndicadorCapitulo> & { indicador_id: string; capitulo_id: string }
        Update: Partial<IndicadorCapitulo>
        Relationships: []
      }
      temas_materiais: {
        Row: TemaMaterial
        Insert: Partial<TemaMaterial> & { nome: string }
        Update: Partial<TemaMaterial>
        Relationships: []
      }
      indicador_temas_materiais: {
        Row: IndicadorTemaMaterial
        Insert: Partial<IndicadorTemaMaterial> & { indicador_id: string; tema_material_id: string }
        Update: Partial<IndicadorTemaMaterial>
        Relationships: []
      }
      capitulo_temas_materiais: {
        Row: CapituloTemaMaterial
        Insert: Partial<CapituloTemaMaterial> & { capitulo_id: string; tema_material_id: string }
        Update: Partial<CapituloTemaMaterial>
        Relationships: []
      }
      capitulo_topicos: {
        Row: CapituloTopico
        Insert: Partial<CapituloTopico> & { capitulo_id: string; texto: string }
        Update: Partial<CapituloTopico>
        Relationships: []
      }
      ods: {
        Row: Ods
        Insert: Partial<Ods> & { id: number; numero: number; nome: string }
        Update: Partial<Ods>
        Relationships: []
      }
      tema_material_ods: {
        Row: TemaMaterialOds
        Insert: Partial<TemaMaterialOds> & { tema_material_id: string; ods_id: number }
        Update: Partial<TemaMaterialOds>
        Relationships: []
      }
      projetos: {
        Row: Projeto
        Insert: Partial<Projeto> & { tema_material_id: string; nome: string }
        Update: Partial<Projeto>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
