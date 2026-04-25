# Changelog

## v1.2.8 — 2026-04-25 (guard contra perda de dados em todos os diálogos)

### Problema

- Até aqui qualquer clique fora do diálogo (backdrop) ou tecla `Esc` fechava-o silenciosamente, descartando todas as alterações em curso. Em formulários grandes (treino, jogo, atleta, drill) significava perder vários minutos de trabalho.

### Solução base

- Novo componente partilhado `src/app/components/shared/GuardedDialog.tsx`:
  - `useUnsavedChangesGuard({ isDirty })` — intercepta o `onClose`, mostra um `<Dialog>` de confirmação ("Descartar alterações?") com botões "Continuar a editar" / "Descartar" e só executa o close real se o utilizador confirmar.
  - `<GuardedDialog>` — wrapper drop-in para `<Dialog>`. Consome `isDirty` e delega tudo no hook acima. Outras props (`maxWidth`, `fullWidth`, `slotProps`, ...) são reencaminhadas tal e qual.
  - `useFormSnapshotDirty(open, value)` — snapshot estável (chaves ordenadas, sem `undefined`/`function`) do estado actual quando o overlay abre. Comparado por igualdade de strings com o estado corrente, é o único mecanismo dirty-tracking necessário no consumidor (sem flags manuais espalhadas).
- Localização: novas chaves `discardChanges.title|message|keepEditing|confirm` em `pt/common.json` e `en/common.json`.

### Editor de drills

- `DrillGraphicEditor` expõe agora `onDirtyChange?: (dirty: boolean) => void`. O signature do `state` inicial é guardado em `useRef`; um `useEffect` compara com o `state` actual e chama o callback. `handleSave` reseta o snapshot (e dispara `onDirtyChange(false)`) para não pedir confirmação logo a seguir a um save bem sucedido.
- `GraphicsPanel` envolve o full-screen editor em `<GuardedDialog isDirty={editorDirty}>`.

### Cobertura — diálogos protegidos

Aplicado a todos os diálogos editáveis da app. Diálogos puramente informativos / de confirmação (delete, alert details, microcycle preview, drill picker, deploy confirm) ficam intactos para não introduzir prompts redundantes.

- People: `accounts/page.tsx`, `accounts/assets/changePasswordDialog.tsx`, `staff/page.tsx`, `athletes/page.tsx`.
- Organização: `echelons/page.tsx`, `seasons/page.tsx`, `competitions/page.tsx`, `cycles/page.tsx`, `equipments/page.tsx` (4 diálogos: add color, edit color, add item, edit item), `opponents/page.tsx`, `teams/page.tsx` (formulário + gestão de atletas), `teams/components/page.tsx` (legado).
- Drills: `drills/page.tsx` (criação) e `drills/[id]/components/TopicsDialog.tsx` (selecção + admin tópicos) e `GraphicsPanel.tsx` (editor full-screen).
- Treinos: `practices/page.tsx` (formulário principal — captura cycle/notes, attendance e groups num só snapshot — e diálogo de definições) e `practices/components/CopyPracticeDialog.tsx`.
- Jogos: `games/page.tsx` (add + edit) e `games/components/FpbImportDialog.tsx` (snapshot só fica activo depois do preview carregar e enquanto não houver `result`, para evitar prompts no estado de loading e no estado pós-import).

### Notas técnicas

- O guard partilhado usa `Omit<DialogProps, 'onClose'>` e re-tipa `onClose: () => void`, mantendo a API ergonómica que já existia em todos os call sites (`onClose={() => setOpen(false)}`).
- Removido `disableEscapeKeyDown` do prompt interno (deprecated em MUI v9). O Esc no prompt = "continuar a editar", o que continua a ser o comportamento desejado.
- Build (`npm run build`) verde, sem warnings novos. Sem alterações de schema/db.

## v1.2.7 — 2026-04-25 (drill thumbnails com campo + ciclo no topo)

### Thumbnails das exercícios renderizam o campo

- `PracticeItemsList.tsx` deixa de fazer `dangerouslySetInnerHTML` directo do SVG arquivado (que só contém os elementos + metadata, sem court). Novo componente `GraphicPreview` que faz `parseEditorState(svg)` e re-renderiza com `renderDrillGraphicSvg({ state, theme: courtTheme })`, exactamente como o editor de drills.
- `courtTheme` é construído uma vez por instância (usa `useSession` + `useClub`) e propagado para `SortableItem` → `GraphicsColumn` → `GraphicRow`. Resultado: as miniaturas do plano de treino mostram agora o campo FIBA com as cores/padrão/logo do clube em vez de aparecerem "soltas" sobre fundo branco.
- Como o tema é o do clube actual e não está congelado no SVG guardado, alterar a aparência do campo nas definições do clube actualiza imediatamente todas as miniaturas históricas.

### Resumo de ciclo + notas no topo do diálogo de treino

- Novo componente `PracticeCycleSummary` (`src/app/utilities/practices/components/PracticeCycleSummary.tsx`) que cruza `useMacrocycles()` + `useMicrocycles()` com a equipa e a data do treino para mostrar o macro / meso / micro activos.
- Cada ciclo vira um pequeno cartão com cor à esquerda (azul/roxo/verde), número, nome, intervalo de datas e as notas (`pre-wrap`, com placeholder em itálico quando não há notas).
- O painel é colocado logo a seguir ao bloco de data/horas, antes do tópico — para o treinador ler o contexto do ciclo (e respectivas notas) ainda antes de começar a planear o treino.
- Mensagens distintas para "selecione equipa primeiro" (info) e "nenhum ciclo activo cobre esta data" (warning).
- Novas chaves `practice.cycleSummary.*` (PT/EN).

## v1.2.6 — 2026-04-25 (practice groups DB + GUI/perf polish)

### Persistência dos grupos no `Practice`

- Novo campo `Practice.groups Json?` na schema (`prisma db push` aplicado). Shape: `{ sets: Array<{ id, name, teams: Array<{ id, name, players: (athleteId|null)[] }> }> }`.
- Novo helper `src/lib/practiceGroups.ts` (`sanitisePracticeGroups`) usado tanto na ingestão (POST/PUT) como na hidratação dos GETs. Filtra IDs de atletas que já não pertencem ao plantel, valida tipos e limita tamanhos máximos defensivos (16 sets, 12 equipas/set, 30 jogadores/equipa).
- API `/api/practices` (GET/POST) e `/api/practices/[id]` (GET/PUT) passam a ler/escrever `groups`. O endpoint de duplicação (`/api/practices/[id]/duplicate`) copia os grupos quando o team destino é o mesmo (caso contrário descarta).
- Tipos: `PracticeGroupsInterface`, `PracticeGroupSetInterface`, `PracticeGroupTeamInterface` adicionados a `src/types/practices/types.ts`. `PracticeInterface.groups` e `SavePracticeInput.groups` propagados.

### `PracticeGroupsBuilder` agora é controlled + memoizado

- Componente passa a aceitar `value` / `onChange` (a página `practices/page.tsx` mantém o estado em `form.groups`). Já não tem estado interno duplicado.
- IDs estáveis para sets/teams via contadores incrementais + base36 (sem `Math.random()` em cada render — evitam colisões e mantém referências para `React.memo`).
- Sub-componentes `TeamCard` e `PlayerSlot` extraídos e envolvidos em `React.memo`. Os filtros de "atletas disponíveis" são pré-computados num único `useCallback` em vez de `Array.filter` por `<MenuItem>`.
- `MenuProps.slotProps.paper.maxHeight` adicionado para limitar a altura dos selects (não mais menus que sangram para fora do diálogo).
- `activeSetId` deixou de ser estado React — agora é `useRef` + `forceRender`. Trocar de set deixa de invalidar o `value` do componente e elimina re-renders cascata da árvore acima.

### `AttendanceTable` mais leve e mais alinhado

- Cada linha vive agora num `AttendanceRowCard` extraído + `React.memo`. Numa sessão com 16+ atletas, alterar um campo já só re-renderiza essa linha.
- Handlers (`handleHasToAttendToggle`, `handleMarkAttended`, `handleMarkAbsent`, `handleToggleLate`, `handleChangeLateMinutes`) passaram para `useCallback`.
- Layout simplificado: o toggle "tem de estar" deixou de aparecer em duas posições diferentes (esquerda quando ativo, direita quando inativo) — agora vive sempre na mesma coluna fixa de 36 px à esquerda do nome. O nome do atleta tem `text-overflow: ellipsis` (com `title=` para o nome completo) e ficou alinhado de forma consistente em todas as linhas.
- Scroll horizontal removido em desktop (substituído por `flexWrap: 'wrap'` em xs). O badge "presentes" só aparece quando `showPresenceColumns` está ligado (no formulário de criar prática deixa de poluir o cabeçalho).

### Localização

- `practice.groups.hintUnsaved` (PT/EN) explica que os grupos só ficam persistidos ao guardar o treino.

### Dribble style em FIBA

- `ElementRenderer.tsx` passa a usar um novo `buildDribblePath` (substitui o antigo `buildWavyPath`). O algoritmo amostra a curva suave do utilizador (`sampleSmoothCurve`, passos de 4 unidades) e coloca waypoints alternados a ±amp (18) de cada meia-onda (44 un), rematando com uma cauda recta de ~24 un para a seta alinhar bem. Como `|amp| > wavelength/2`, as Q-curves formam cúspides/loops como no editor da FIBA — adeus sinusóide preguiçosa.

### Pontos das linhas editáveis (add/remove)

- `DrillGraphicEditor` guarda a última posição do rato (`lastSvgPointRef`) no `handleCanvasPointerMove`.
- Atalho **Espaço**: se uma linha estiver seleccionada, insere um novo ponto no segmento mais próximo do cursor (a âncora fica exactamente onde está o rato — matches FIBA).
- **Alt-clique** (ou Shift-clique) num handle vermelho de ponto: remove esse ponto. Atalho de teclado alternativo: **`-`** remove o ponto mais perto do cursor.
- Protecção: nunca remove abaixo de 2 pontos (para não degenerar a linha).
- `SelectionEditor` mostra a hint `drillEditor.linePointsHint` para setas seleccionadas.
- Os atalhos de teclado ignoram inputs/áreas de texto (`isEditable` helper) — já não há conflito com o texto dos TextFields.

### Fusão "Cores e aspeto do clube"

- Accordion "Cores" (background/foreground) saiu de `ClubDetails` e foi absorvida por `ClubCourtTheme`, agora chamada `club.appearance.title` = "Cores e aspeto do clube" / "Club colours & appearance". Sub-secções internas: `brandSection` (Cores do clube) e `courtSection` (Aspeto do campo).
- `ClubCourtTheme` deixa de ter fetch/save próprios: agora aceita `selectedClub` + `onEditChange` (mesmo contrato do `ClubDetails`). Tudo é persistido pelo botão Save principal do formulário.
- Todas as cores (cores do clube + cores do campo) usam `CompactPicker` (`react-color`) com swatch ao lado — mesma UX.
- Preview de clube (mini cartão com nome) dentro da secção "Cores do clube" usa `brandBg`/`brandFg` e actualiza em tempo real.
- Preview do campo continua em full court (1500×2800) para se ver o logótipo.
- Expanded section key em `page.tsx` passou de `'courtTheme'` para `'appearance'`.

### Padrões do chão — iteração anterior (v1.2.4) mantém-se

Sem alterações visuais adicionais nos padrões (wood/parquet/concrete/clay) nesta versão.

## v1.2.4 — 2026-04-21 (court theme: merge & polish)

### `ClubCourtTheme` consolida a configuração visual do campo

- **Padrões muito melhores** (`FibaCourt.tsx`):
  - `wood`: réguas longas (180×640) com gradientes em duas tábuas adjacentes, juntas verticais e cross-seams, veios em curva e nós ocasionais.
  - `parquet`: bloco 160×160 herringbone com tábuas perpendiculares (uma com veio horizontal, outra vertical) e contornos pretos — fica imediatamente reconhecível.
  - `concrete`: cinza com pequenos agregados, ruído fino (sub-pattern `concrete-noise`) e juntas de dilatação.
  - `clay`: vermelho com bandas mais escuras alternadas e poeira clara/escura.
- **Color pickers a sério**: `ClubCourtTheme` deixa de usar `TextField`+hex e passa a usar `CompactPicker` da `react-color` (mesmo componente do `ClubDetails`), com swatch ao lado de cada cor.
- **Cor das linhas do campo** (marcações brancas) configurável: novo `theme.lineColor` propagado a todo o `FibaCourt` (frame, `HalfCourtLines`, linha do meio, círculo/semi-círculo central, throw-in marks).
- **Cor de fora do campo** (BLOB/SLOB) configurável via `theme.marginColor` — já era lido por `FibaCourt`, agora é editável a partir do clube.
- **Checkbox para mostrar/esconder o logótipo central** dentro de `ClubCourtTheme`. Persistido como `Club.courtShowLogo` (boolean, default `true`).
- **Preview campo inteiro** em `ClubCourtTheme`: o painel de pré-visualização mudou de meio-campo para `full` (com `aspectRatio: 1500/2800`, `maxHeight: 600`) — agora vê-se o logo do clube no círculo central enquanto se mexe nas cores.
- **Schema do `Club`** ganha `courtLineColor`, `courtMarginColor` e `courtShowLogo`. `courtBackground` foi alargado para `VarChar(16)` para suportar id de pattern (`wood/parquet/concrete/clay`) ou hex. `mapClubToInterface`, `ClubInterface` e `PUT /api/clubs/[clubId]` propagam os novos campos.
- **Editor consome a configuração do clube**: `DrillGraphicEditor` agora propaga `lineColor` e `marginColor` ao `FibaCourt` e inicializa o toggle de logo a partir de `club.courtShowLogo` (o utilizador pode na mesma desligar para um drill específico).
- Traduções PT/EN: novos `club.courtTheme.lineColor`, `club.courtTheme.marginColor`, `club.courtTheme.showLogo`; renomeação de labels para "Aspeto do campo" / "Court appearance" e remoção do "(hex)" agora que existe color picker.

## v1.2.3 — 2026-04-21 (drill editor v2)

### Drill graphic editor — linhas, padrões e configuração por clube

- **Simplificação das linhas (RDP)**: ao largar o rato as linhas de movimento/drible/bloqueio/linha genérica passam por `simplifyRDP` (tolerância 10) para ficarem com os pontos estritamente necessários em vez de dezenas de pontos ao longo do traço. Render com curvas quadráticas suaves (`buildSmoothPath`) — fica fluído mesmo depois da simplificação.
- **`passing` é sempre recta**: mesmo que o utilizador arraste em ziguezague, a linha de passe guarda e desenha só os extremos.
- **Seta no fim sempre visível**: ao ter pontos simplificados o último segmento tem uma direcção bem definida e o `marker-end="url(#arrowhead-solid)"` renderiza correctamente com `context-stroke`.
- **Seta de lançamento aponta para o cesto**: novo helper `basketForShot(x, y, fullCourt)` no `FibaCourt` expõe as posições dos dois cestos (`BASKET_Y_TOP`, `BASKET_Y_BOTTOM`). `ShootingShape` calcula a rotação do "tack" via `atan2(dy, dx)` para o cesto do meio-campo onde o ícone foi colocado. No meio campo aponta sempre para o cesto superior.
- **Cor das linhas customizável**:
  - Nova entrada no menu `Mudar cor das linhas` (estado `lineColor`, default `DEFAULT_LINE_COLOR`).
  - Linhas criadas passam a usar `lineColor`.
  - `SelectionEditor` mostra paleta de cores quando se selecciona uma seta; clicar actualiza `element.color`.
- **Padrões de fundo** para o piso do campo:
  - Novos patterns SVG em `FibaCourt.tsx`: `wood` (já existia), `parquet`, `concrete`, `clay`. Exportados como `COURT_PATTERNS` + helper `isCourtPattern()`.
  - `theme.background` pode ser um preset (`'wood' | 'parquet' | 'concrete' | 'clay'`) ou uma cor hex. `FibaCourt` decide qual renderizar.
- **Cores do campo nas definições do clube**:
  - Novo componente `ClubCourtTheme` em `src/app/utilities/club/assets/clubCourtTheme.tsx` integrado na página `/utilities/club` como accordion `courtTheme`.
  - Mostra pequenos swatches com meio-campo desenhado por padrão (preview ao vivo) + inputs de cor (hex) para fundo/área restritiva/círculo central, guardando via `useUpdateClub`.
  - Preview maior ao lado do formulário com a composição final incluindo o logo do clube no círculo central.
- **Editor usa as cores do clube por defeito**: `DrillGraphicEditor` lê `courtBackground/courtKeyColor/courtCenterColor` via `useClub(selectedClubId)` e monta o `effectiveTheme` com a hierarquia: tema do clube → overrides locais → logo toggle. O diálogo de cores no editor foi simplificado para um atalho para as definições do clube (botão `Abrir definições do clube`) + toggle do logótipo central.
- Novas traduções PT/EN: `drillEditor.changeLineColor`, `drillEditor.newLineColor`, `drillEditor.courtThemeHint`, `drillEditor.goToClubSettings`, e todo o sub-objecto `club.courtTheme.*` (título, patterns, hints e labels de cor).

## v1.2.2 — 2026-04-21 (drill editor polish)

### Drill graphic editor — áreas, linhas e tema por clube

- **Áreas (círculo/quadrado/triângulo) deixam de manter rácio**. `AreaElement` passou de `{ size }` para `{ width, height }` independentes. A renderização usa `ellipse` (círculo elástico), `rect` (rectângulo) e `path` dinâmico (triângulo proporcional ao bounding box).
- **8 pegas de resize** na selecção de áreas (4 cantos + 4 meios): ao arrastar uma pega o lado oposto fica ancorado — só cresce o lado que agarro, com cursores `ns-resize`/`ew-resize`/`nwse-resize`/`nesw-resize`.
- **Linhas desenhadas à mão** (`movement`, `passing`, `dribbling`, `screen`, `line`): pressionar + arrastar + largar. São acumulados pontos a cada ~18 unidades, permitindo ziguezagues e curvas.
- **Reshape de linhas**: ao seleccionar uma seta aparecem pontos vermelhos em cada vértice; arrastar qualquer ponto altera a forma da linha sem ter de a refazer.
- **Cores do campo por clube**: novos campos `courtBackground`, `courtKeyColor`, `courtCenterColor` no modelo `Club` (Prisma `db push`). A API `PUT /api/clubs/[clubId]` aceita e persiste-os.
- Editor carrega o tema do clube activo via `useClub` (session → `selectedClubId`). Botão **Gravar cores no clube** no diálogo de tema usa `useUpdateClub`.
- **Logótipo do clube no círculo central** por defeito. O `FibaCourt` suporta `theme.centerLogoUrl` e desenha um `<image>` clipado ao círculo. Toggle no diálogo de tema para ligar/desligar.
- `SelectionEditor` das áreas: dois campos `Largura`/`Altura` (em vez de `Tamanho`).
- Novas traduções PT/EN: `drillEditor.width`, `drillEditor.height`, `drillEditor.clubLogoCenter`, `drillEditor.saveClubTheme`.

## v1.2.1 — 2026-04-23 09:55

### Infra / DX

- Adicionado `@tanstack/react-query` (v5) + `@tanstack/react-query-devtools` como gestor de estado de dados remotos.
- Novo `QueryProvider` em `src/components/QueryProvider.tsx` montado no `RootLayout`, com defaults sensatos (`staleTime: 30s`, `gcTime: 5min`, `refetchOnWindowFocus: false`, `retry: 1`). Devtools apenas em dev.
- Novos hooks em `src/hooks/useAthletes.ts`: `useAthletes`, `useEquipmentColors`, `useSaveAthlete`, `useDeleteAthlete` (inclui update otimista na eliminação).
- Página de atletas (`/utilities/athletes`) migrada para `useQuery` / `useMutation`:
  - Removido `useState` + `useEffect` manuais para fetch (athletes + equipment colors).
  - Remover um atleta agora é otimista (UI atualiza antes do servidor responder).
  - Botão "Actualizar" usa `refetch` e fica desativado enquanto a query está a reexecutar.
  - Todo o feedback de erro via `errorMessage` preservado (observando `query.error`).

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
