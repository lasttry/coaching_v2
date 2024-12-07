import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GameAthleteInterface, GameInterface, ObjectiveInterface } from "@/types/games/types";
import { validateGameData } from "../utils/utils";

type Params = Promise<{ id: number }>;
const prisma = new PrismaClient();

export async function GET(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (!id) {
    return NextResponse.json({ error: "Invalid Game ID" }, { status: 400 });
  }

  const settings = await prisma.settings.findFirst();
  const payload = {
    where: {
      id,
    },
    include: {
      gameAthletes: {
        select: {
          number: true, // Include the 'number' field
          period1: true,
          period2: true,
          period3: true,
          period4: true,
          athlete: true,
        },
      },
      oponent: true,
      objectives: true,
    },
  }
  console.log(payload)
  const game = await prisma.games.findUnique(payload);
  console.log(game);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json({ settings, game: { ...game, objectives: game.objectives || [] } });
}

// PUT method to update an existing game by ID
export async function PUT(request: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const gameId = Number(params.id);
  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    const data: GameInterface = await request.json();

    // Validate the data
    const validationErrors = validateGameData(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(" ") },
        { status: 400 },
      );
    }

    // Update the game details with `gameNumber` for each athlete
    const payload = {
      where: { id: gameId },
      data: {
        number: data.number,
        date: new Date(data.date),
        away: data.away,
        competition: data.competition,
        subcomp: data.subcomp,
        oponentId: Number(data.oponentId),
        notes: data.notes || null,
        gameAthletes: {
          deleteMany: {
            gameId: gameId,
          },
          create: data.gameAthletes?.map((athlete: GameAthleteInterface) => ({
            athleteId: athlete.athlete?.id, // Ensure athleteId exists
            number: athlete.number || '', // Provide a fallback for number
            period1: athlete.period1 || false, // Provide fallback for periods
            period2: athlete.period2 || false,
            period3: athlete.period3 || false,
            period4: athlete.period4 || false,
          })) || [], // Fallback to an empty array if data.gameAthletes is undefined or null
        },
        objectives: {
          deleteMany: {
            gameId: gameId,
          },
          create: data.objectives?.map((objective: ObjectiveInterface) => ({
            title: objective.title,
            description: objective.description,
            type: objective.type
          }))
        },
      },
    }
    console.log(payload)
    const updatedGame = await prisma.games.update(payload);
    console.log(updatedGame);
    return NextResponse.json(updatedGame, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating game:", error.message);
      return NextResponse.json(
        { error: "An error occurred while updating the game." },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred." },
      { status: 500 },
    );
  }
}

// DELETE method to delete a game by ID
export async function DELETE(
  request: Request,
  segmentData: { params: Params },
) {
  const params = await segmentData.params;
  const gameId = params.id;
  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    // Delete the game
    await prisma.games.delete({
      where: { id: gameId },
    });

    return NextResponse.json(
      { message: "Game deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting game:", error.message);
      if (error.message.includes("P2003")) {
        // Handle foreign key constraint errors
        return NextResponse.json(
          { error: "Unable to delete game due to related records." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "An error occurred while deleting the game." },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred." },
      { status: 500 },
    );
  }
}
