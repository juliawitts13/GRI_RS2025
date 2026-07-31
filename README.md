# Painel do Relatório de Sustentabilidade 2025 — GrupoSC

Dashboard de gestão para coordenar a elaboração do Relatório de Sustentabilidade 2025 do GrupoSC: progresso geral do projeto, coleta de indicadores GRI, respondentes por área e cronograma.

## Stack

- React + TypeScript + Vite + Tailwind CSS v4
- Supabase (Postgres + Auth) como backend
- Recharts / componentes próprios para visualização

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com a URL e a anon/publishable key do projeto Supabase
npm run dev
```

## Estrutura

- `src/pages` — telas (Dashboard, Coleta de Indicadores, Respondentes, Cronograma, Login)
- `src/hooks` — acesso a dados (Supabase) por entidade
- `src/features` — componentes específicos de um módulo (import de planilha, formulários)
- `src/components/ui` — componentes de interface reutilizáveis
- `src/lib` — utilitários (cálculo de progresso, domínio de status/pilar GRI, import de planilha)

## Dados

- **Cronograma**: importado uma vez do `Cronograma.xlsx` do projeto para a tabela `cronograma_tarefas`; usado na tela de Cronograma e no resumo do Dashboard.
- **Indicadores GRI**: a tabela `indicadores` foi semeada com os 52 códigos/títulos GRI do escopo do relatório (sem área, respondente ou status/prazo pré-atribuídos). Área e respondente são atribuídos pela própria interface, ou em lote pela tela de importação de planilha (CSV/XLSX) em Coleta de Indicadores.
- **Progresso geral**: calculado pela linha do tempo do projeto (hoje em relação ao intervalo total do cronograma), não pela contagem de status dos indicadores.
