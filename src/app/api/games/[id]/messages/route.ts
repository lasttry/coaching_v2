import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';
import { parseAndValidateId } from '@/utils/validateId';
import { prisma } from '@/lib/prisma';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not configured');
}

const client = new OpenAI({
  apiKey,
});

type Params = Promise<{ id: string }>;

export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const session = await auth();
  if (
    !session?.user ||
    !session.user.selectedClubId ||
    isNaN(Number(session.user.selectedClubId))
  ) {
    log.error('games/[id]/messages/route.ts>GET: session invalid or club not selected');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = await segmentData.params;
    const gameId = parseAndValidateId(params.id, 'game');
    if (gameId instanceof NextResponse) return gameId;

    const payload = {
      where: {
        id: gameId,
        clubId: Number(session.user.selectedClubId),
      },
      include: {
        gameAthletes: {
          include: {
            athlete: true,
          },
        },
        opponent: true,
        objectives: true,
        club: true,
        competition: true,
        competitionSerie: true,
        gameEquipments: true,
        venue: true,
      },
    };
    const game = await prisma.game.findUnique(payload);
    const gameDate = game?.date ?? new Date();
    const gameStartTime = gameDate;
    const encontroMillis = gameStartTime.getTime() - 75 * 60 * 1000; // 1h15m antes
    const encontroDate = new Date(encontroMillis);
    const gameData = {
      Adversário: game?.opponent.name,
      Local: game?.venue?.name,
      Data: gameDate.toISOString(),
      Encontro: encontroDate.toISOString(),
      'Data Actual': new Date().toISOString(),
    };
    const prompt = `
Quero que cries uma mensagem motivadora no estilo do Ricardo Santos (treinador de basquetebol).
Tom direto, simples, firme mas positivo, próprio para enviar num grupo de WhatsApp de atletas Sub18.

Usa sempre:
- linguagem clara
- foco em esforço, atitude e compromisso
- evitar floreados; é objetivo mas motivador
- avisa sobre refeições, lanche para o entrevalo

Dados do jogo:
${JSON.stringify(gameData, null, 2)}

Produz apenas o texto final pronto para colar no WhatsApp.
`;

    const completion = await client.responses.create({
      model: 'gpt-4o', // usa sempre o último modelo estável
      input: prompt,
    });

    const message = completion.output_text || '';
    return NextResponse.json({ message });
  } catch (err) {
    log.error('Error generating message:', err);
    return NextResponse.json({ error: 'Erro ao gerar mensagem' }, { status: 500 });
  }
}
