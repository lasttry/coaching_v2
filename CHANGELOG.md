# Changelog

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
