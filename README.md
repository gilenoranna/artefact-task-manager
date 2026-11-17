# Gerenciador de Tarefas

Aplicação simples para criar, listar, editar e excluir tarefas, feita com **Next.js 15** e
**tRPC**. Os dados ficam em memória (sem banco de dados) e todos os exemplos são fictícios.

## Stack

- Next.js 15 (App Router) e React 19
- tRPC 11 + TanStack Query
- zod (validação)
- Tailwind CSS 4 e sonner (toasts)

## Como rodar

Requer Node.js 20 ou superior. Não há variáveis de ambiente (veja `.env.example`).

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:3000
```

Build de produção:

```bash
npm run build
npm run start      # http://localhost:3000
```

Lint: `npm run lint`.

## Funcionalidades

- Listagem renderizada no servidor (SSR), com infinite scroll (10 tarefas por vez).
- Criar, editar e excluir tarefas (a exclusão pede confirmação).
- Validação no frontend e no backend; mensagens de erro em português.
- Feedback com toasts e estados de carregando, lista vazia e erro (com "Tentar novamente").

Ao iniciar, o servidor carrega 33 tarefas fictícias para que o scroll seja visível.

## Estrutura

```
src/
├── app/                 # rotas (App Router): lista, /tasks/new, /tasks/[id]/edit, API do tRPC
├── components/          # lista, formulário e componentes de estado (loading, vazio, erro)
├── lib/                 # tradução de erros para PT-BR e atualização do cache da lista
├── server/
│   ├── store/           # dados em memória (sem conhecer o tRPC)
│   ├── routers/         # procedures do tRPC (camada fina sobre o store)
│   ├── schemas.ts       # schemas zod e tipos
│   └── trpc.ts          # inicialização do tRPC
└── trpc/                # clientes do tRPC (navegador e servidor) e QueryClient
```

## Como funciona

**Fluxo:** a UI chama uma procedure do tRPC → o router valida a entrada com zod → o store lê ou
altera a coleção em memória → o resultado volta tipado para a UI.

**SSR da listagem:** a página inicial é um Server Component que busca a primeira página de
tarefas direto no router (sem requisição HTTP) e entrega o resultado ao cliente com
`HydrationBoundary`. O primeiro HTML já traz as tarefas e o navegador não refaz a busca ao
carregar. A página é `force-dynamic`; sem isso, o Next a pré-renderizaria no build e congelaria a
lista.

**Infinite scroll:** o `task.list` devolve uma página por vez. Um elemento sentinela no fim da
lista é observado por um `IntersectionObserver`, que carrega a próxima página pouco antes de ela
ficar visível.

## Operações do backend

| Procedure     | Tipo     | Entrada                                      | Retorno                  |
|---------------|----------|----------------------------------------------|--------------------------|
| `task.list`   | query    | `{ limit?: 1–50 (padrão 10), cursor? }`      | `{ items, nextCursor }`  |
| `task.byId`   | query    | `{ id }`                                     | tarefa                   |
| `task.create` | mutation | `{ title, description? }`                    | tarefa criada            |
| `task.update` | mutation | `{ id, title, description? }`                | tarefa atualizada        |
| `task.delete` | mutation | `{ id }`                                     | `{ id }`                 |

Uma tarefa tem `id`, `title`, `description` (opcional) e `createdAt`. Entrada inválida (por
exemplo, título vazio) responde com `BAD_REQUEST`; um `id` inexistente responde com `NOT_FOUND`.
O `task.byId` não faz parte do CRUD básico: serve para a página de edição carregar uma única
tarefa.

## Decisões

- **Store em `globalThis`:** os dados não são perdidos quando o Next recarrega módulos em
  desenvolvimento, e todos os módulos do servidor compartilham a mesma coleção.
- **Router fino:** o store só conhece dados; o router cuida de validação e dos códigos de erro.
- **Paginação por cursor de posição** (`createdAt` + `id`): continua correta se a tarefa do cursor
  for excluída durante o scroll, e criar ou excluir tarefas não repete nem pula itens.
- **Validação dupla:** o formulário valida para dar resposta imediata; o backend valida de novo,
  pois é ele que merece confiança.
- **Erros em um só lugar:** o backend responde em inglês (`code` + `message`) e um único helper
  (`src/lib/error-messages.ts`) os traduz para o português mostrado na tela.
- **Datas com fuso fixo** (`America/Sao_Paulo`): servidor e navegador geram o mesmo texto, o que
  evita erro de hidratação.

## Limitações

- Os dados somem ao reiniciar o servidor (sem persistência, por requisito do desafio).
- Sem autenticação: qualquer pessoa com acesso à aplicação vê e altera todas as tarefas.
- Sem testes automatizados.
- A ordem é sempre "mais recente primeiro"; não há busca nem filtros.
