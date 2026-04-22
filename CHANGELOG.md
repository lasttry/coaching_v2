# Changelog

## v1.2.0 — 2026-04-22 23:03

### Integração FPB

- Novos campos `Club.fpbClubId`, `Team.fpbTeamId` e `Game.fpbGameId` no schema + migrações correspondentes.
- Parser que faz fetch de `https://www.fpb.pt/equipa/equipa_<id>/` e extrai o calendário.
- Endpoint `POST /api/teams/[id]/fpb-import` que cria jogos em falta.
- Botão "Importar da FPB" na página de jogos com diálogo de preview, seleção de jogos a importar (checkbox por jogo) e seleção/criação interativa de oponente, competição e série.
- Campos "ID FPB" adicionados à edição de clube e de equipa.

### Jogos

- Novo estado `completed` (automático para datas passadas, alternável manualmente).
- Validação: jogos não concluídos exigem data futura.
- Diferenciação visual entre jogos passados e futuros na listagem, com destaque para o próximo jogo.

### Equipamentos

- Novas propriedades `backgroundColor` e `numberColorHex` em `EquipmentColor` (cor principal e cor do número).
- Página de equipamentos redesenhada com acordeões aninhados agrupados por escalão, mantendo chips coloridos por item.

### Redesenho de UI

- **Atletas**: agrupamento por ano de nascimento, pesquisa, filtros de estado e tabela em acordeões.
- **Oponentes**: paginação dinâmica, layout em cartões e filtros melhorados.
- **Equipas**: ao selecionar uma equipa mostra os atletas associados e os jogos futuros.
- **Escalões**: cartões com avatar de género, pesquisa e `ToggleButtonGroup` de filtro por género com contadores.
- **Competições**: agrupadas por escalão em acordeões, com cartões, pesquisa e filtro.
- **Definições de Clube**: selecção em grelha de cartões com pesquisa; edição em acordeões controlados (Identificação, Imagens, Cores, Pavilhões, Gerir Contas, Servidor de Email) — apenas um aberto de cada vez — com barra de ações sticky no rodapé.
- **Gerir Contas**: tabela densa substituída por cartões por conta com chips clicáveis de role (com ícones e cores por role), pesquisa condicional e estado vazio melhorado.
- **Pavilhões**: representados como chips com `onDelete` (mesmo padrão dos itens de equipamento).

### i18n

- Adicionadas todas as chaves pt/en para os novos textos (FPB, status de jogo, estado de email, pesquisa de contas, etc.) respeitando a estrutura hierárquica.

### Correções de Tipos

- Corrigidos erros pré-existentes de `MUI Select` em `competitions/page.tsx` e `equipments/page.tsx` (comparação entre `number` e `string`).

### Regras do projeto

- Regra `git-workflow.mdc` atualizada para impor bump semver obrigatório em cada push, com entrada correspondente no `CHANGELOG.md`.

## v1.1.1 — 2026-04-22 14:05

### Correções

- Adicionado `.npmrc` com `legacy-peer-deps=true` para resolver `ERESOLVE` em produção: `@auth/core@0.41.2` declara `peerOptional nodemailer@^7.0.7` mas usamos `nodemailer@^8.0.5` (peer opcional, não afeta o runtime). Sem isto, `npm install` falha em ambientes novos sem a flag manual.

## v1.1.0 — 2026-04-21 20:12

### Sistema de Alertas

- Novos modelos `Alert` e `AlertRecipient` com 4 tipos (`INFO`, `ATTENTION`, `IMPORTANT`, `PRIORITY`) e estados por destinatário (`UNREAD`, `READ`, `DELETED`).
- Sino no header com `Badge` do número de alertas por ler, popover com abas "Ativos" e "Vistos", ações para marcar como lido/por ler e eliminar.
- Clicar numa alerta abre overlay com a informação completa (título, mensagem, link externo opcional).
- Polling a cada 60s e abort controller para evitar `setState` após unmount.
- Primeira categoria implementada: aniversário de atleta (enviado aos admins do clube e aos treinadores com conta ligada).
- Endpoint `POST /api/alerts/generate` protegido por `CRON_SECRET` para ser chamado pelo cron.

### Ligação Staff ↔ Account

- `Staff.accountId` opcional com constraint `@@unique([clubId, accountId])` — um utilizador só pode estar ligado a um staff por clube.
- Endpoints `/api/staff` e `/api/staff/[id]` atualizados para ler/gravar `accountId` com validação (conta pertence ao clube, não está já ligada a outro staff).
- Novo endpoint `GET /api/staff/accounts` com lista de contas disponíveis + info de staff já ligado.
- Diálogo de staff com `Autocomplete` "Conta associada" que desativa contas já ligadas a outros staff.

### Servidor de Email por Clube (SMTP)

- Novo modelo `ClubEmailSettings` 1:1 com `Club` (host, port, secure, user, from/reply-to).
- Password SMTP encriptada com AES-256-GCM usando `EMAIL_ENCRYPTION_KEY` do `.env`.
- Painel de definições na edição do clube com toggle de envio ativo, campos SMTP e botão "Enviar email de teste".
- Endpoints `GET/PUT /api/clubs/[clubId]/email-settings` e `POST .../test` (só ADMIN do clube).
- Helpers `src/lib/email/crypto.ts` e `src/lib/email/sender.ts` baseados em `nodemailer`.

### Cron

- Templates systemd em `deploy/cron/` (`coaching-alerts.service`, `coaching-alerts.timer`, `env.example`, `README.md`) para agendar a geração de alertas no servidor self-hosted.

### Correções

- `AlertsMenu` e `Logo` reforçados com `AbortController` + `mountedRef` para evitar warnings `Can't perform a React state update on a component that hasn't mounted yet`.
- `Logo.tsx`: deps do `useEffect` reduzidas a valores primitivos (`email`, `selectedClubId`) para evitar re-fetches repetidos.
- DataGrids de `seasons` e `competitions` com `initialState.pagination.paginationModel.pageSize` — elimina o aviso "page size 100 not present in pageSizeOptions".
- Campo "número do jogo" removido do formulário de jogos (já não é utilizado).

### Dependências

- `nodemailer` 7 → **8.0.5** (latest)
- `next-auth` beta.30 → **5.0.0-beta.31** (latest beta; `@auth/core` fica dedup em 0.41.2)
- `@types/nodemailer` 8.0.0

### Versão

- `package.json`: `0.1.0` → `1.1.0`.

---

## 2026-04-10 18:15

### Fix Deploy NPM Permissions

- Adicionado novo passo "Clean NPM Cache" no deploy
- Remove diretórios temporários problemáticos antes do npm install
- Limpa cache npm para evitar conflitos de permissões

### Ficheiros alterados:

- `src/app/api/admin/deploy/route.ts` - Novo passo de limpeza de cache

---

## 2026-04-10 18:00

### Traduções da Página do Clube

- **ClubAccounts**: Adicionado suporte i18n para traduzir todos os textos em inglês
  - "Manage Accounts" -> "Gerir contas"
  - "Add Account by Email" -> "Adicionar conta por email"
  - "Add Account" -> "Adicionar conta"
  - "Linked Accounts" -> "Contas ligadas"
  - Cabeçalhos da tabela e mensagens de erro também traduzidos

### Ficheiros alterados:

- `src/app/(DashboardLayout)/utilities/club/assets/clubAccounts.tsx` - Adicionado i18n e traduções

---

## 2026-04-10 17:30

### Deploy em Tempo Real (SSE Streaming)

- **API `/api/admin/deploy`**: Convertida para usar Server-Sent Events (SSE) para atualizações em tempo real
- **Frontend**: Nova interface com progresso visual de cada passo do deploy
  - Barra de progresso com contagem de passos e percentagem
  - Lista de passos com ícones de estado (pendente, a executar, sucesso, erro)
  - Painéis expansíveis para ver o output de cada comando
  - Auto-scroll para o output do passo atual
  - Código de saída visível para passos falhados

### Ficheiros alterados:

- `src/app/api/admin/deploy/route.ts` - Implementação SSE com spawn para streaming
- `src/app/(DashboardLayout)/utilities/admin/deploy/page.tsx` - Nova UI com progresso em tempo real
