import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { Area, Respondente, StatusIndicador } from '@/types/db'
import type { IndicadorInput } from '@/hooks/useIndicadores'

function normalizeKey(key: string) {
  return key
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

const HEADER_ALIASES: Record<string, string[]> = {
  codigo_gri: ['codigo gri', 'codigo', 'indicador gri', 'gri', 'codigo do indicador'],
  titulo: ['titulo', 'titulo do indicador', 'descricao', 'nome do indicador'],
  area: ['area', 'area responsavel', 'departamento'],
  respondente: ['respondente', 'respondentes', 'pessoa respondente', 'responsavel'],
  status: ['status', 'situacao'],
  prazo: ['prazo', 'data de entrega', 'data limite', 'deadline'],
}

const STATUS_ALIASES: Record<string, StatusIndicador> = {
  'nao iniciado': 'nao_iniciado',
  'não iniciado': 'nao_iniciado',
  'em andamento': 'em_andamento',
  'aguardando validacao': 'aguardando_validacao',
  'aguardando validação': 'aguardando_validacao',
  concluido: 'concluido',
  'concluído': 'concluido',
  feito: 'concluido',
}

function findHeaderMap(headers: string[]) {
  const normalized = headers.map(normalizeKey)
  const map: Record<string, number> = {}
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const idx = normalized.findIndex((h) => aliases.includes(h) || h === field)
    if (idx !== -1) map[field] = idx
  }
  return map
}

function parseStatus(raw: string | undefined): StatusIndicador {
  if (!raw) return 'nao_iniciado'
  const key = normalizeKey(raw)
  return STATUS_ALIASES[key] ?? 'nao_iniciado'
}

function parsePrazo(raw: string | number | undefined): string | null {
  if (raw === undefined || raw === null || raw === '') return null
  if (typeof raw === 'number') {
    // serial de data do Excel
    const date = XLSX.SSF.parse_date_code(raw)
    if (!date) return null
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
  }
  const str = raw.trim()
  const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (brMatch) {
    const [, d, m, y] = brMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

export interface ImportItem {
  input: IndicadorInput
  respondenteIds: string[]
}

export interface ImportResult {
  itens: ImportItem[]
  avisos: string[]
}

export async function parseIndicadoresFile(
  file: File,
  contexto: { areas: Area[]; respondentes: Respondente[] },
): Promise<ImportResult> {
  const rows: Record<string, unknown>[] = []
  let headers: string[] = []

  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = await file.text()
    const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true })
    const data = parsed.data as string[][]
    headers = data[0] ?? []
    for (const row of data.slice(1)) rows.push(Object.fromEntries(row.map((v, i) => [i, v])))
  } else {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array', cellDates: false })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true })
    headers = (data[0] as string[]) ?? []
    for (const row of data.slice(1) as unknown[][]) rows.push(Object.fromEntries(row.map((v, i) => [i, v])))
  }

  const headerMap = findHeaderMap(headers)
  const avisos: string[] = []
  if (headerMap.codigo_gri === undefined) {
    avisos.push('Não encontrei uma coluna de código GRI. Confira o cabeçalho da planilha.')
    return { itens: [], avisos }
  }

  const areaPorNome = new Map(contexto.areas.map((a) => [normalizeKey(a.nome), a.id]))
  const respondentePorNome = new Map(contexto.respondentes.map((r) => [normalizeKey(r.nome), r.id]))

  const itens: ImportItem[] = []
  rows.forEach((row, i) => {
    const codigo = String(row[headerMap.codigo_gri] ?? '').trim()
    if (!codigo) return
    const titulo = headerMap.titulo !== undefined ? String(row[headerMap.titulo] ?? '').trim() : ''
    const areaNome = headerMap.area !== undefined ? String(row[headerMap.area] ?? '').trim() : ''
    const respondentesTexto =
      headerMap.respondente !== undefined ? String(row[headerMap.respondente] ?? '').trim() : ''

    let areaId: string | null = null
    if (areaNome) {
      areaId = areaPorNome.get(normalizeKey(areaNome)) ?? null
      if (!areaId) avisos.push(`Linha ${i + 2}: área "${areaNome}" não encontrada — deixei sem área.`)
    }

    const respondenteIds: string[] = []
    if (respondentesTexto) {
      for (const nomeBruto of respondentesTexto.split(/[,;]/)) {
        const nome = nomeBruto.trim()
        if (!nome) continue
        const id = respondentePorNome.get(normalizeKey(nome))
        if (id) respondenteIds.push(id)
        else avisos.push(`Linha ${i + 2}: respondente "${nome}" não encontrado — ignorado.`)
      }
    }

    itens.push({
      input: {
        codigo_gri: codigo,
        titulo: titulo || codigo,
        area_id: areaId,
        status: parseStatus(headerMap.status !== undefined ? String(row[headerMap.status] ?? '') : undefined),
        prazo: parsePrazo(headerMap.prazo !== undefined ? (row[headerMap.prazo] as string | number) : undefined),
        ficha_conteudo: null,
      },
      respondenteIds,
    })
  })

  return { itens, avisos }
}
