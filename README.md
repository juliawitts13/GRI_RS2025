# Painel do Relatório de Sustentabilidade 2025 — GrupoSC

Dashboard de gestão para a coleta de indicadores GRI do Relatório de Sustentabilidade 2025 do GrupoSC: progresso geral da coleta, fichas por área e respondente, filtros e importação em planilha.

## Stack

- React + TypeScript + Vite + Tailwind CSS v4
- Supabase (Postgres + Auth) como backend

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com a URL e a anon/publishable key do projeto Supabase
npm run dev
```

## Estrutura

- `src/pages` — telas (Dashboard, Coleta de Indicadores, Respondentes, Áreas, Login)
- `src/hooks` — acesso a dados (Supabase) por entidade
- `src/features` — componentes específicos de um módulo (import de planilha, formulários, atribuição em lote)
- `src/components/ui` — componentes de interface reutilizáveis
- `src/lib` — utilitários (cálculo de progresso, domínio de status/pilar GRI, import de planilha)

## Dados

- **Áreas**: departamentos da empresa, cadastrados na aba "Áreas" antes de vincular respondentes/indicadores a eles.
- **Respondentes**: pessoas designadas para responder indicadores, vinculadas a uma área.
- **Indicadores GRI**: a tabela `indicadores` foi semeada com os 52 códigos/títulos GRI do escopo do relatório (sem área, respondente ou status/prazo pré-atribuídos). Área e respondente são atribuídos pela própria interface — inclusive em lote, selecionando vários indicadores de uma vez — ou pela tela de importação de planilha (CSV/XLSX) em Coleta de Indicadores.
- **Progresso geral**: % de indicadores com status "Concluído" sobre o total.
