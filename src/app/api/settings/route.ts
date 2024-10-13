import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server'; // Use Next.js's response helper

const prisma = new PrismaClient();

// Define interface for Settings data
interface SettingsData {
  teamName: string;
  shortName?: string;
  season?: string;
  homeLocation?: string;
  image?: string; // Base64 image
}

// Helper function to validate season format
const validateSeason = (season: string): boolean => {
  const regex = /^\d{4}\/\d{4}$/;
  return regex.test(season);
};

// Validate incoming settings data
const validateSettings = (data: SettingsData) => {
  if (!data.teamName || data.teamName.length > 50) {
    throw new Error('Team name is required and must be less than 50 characters.');
  }

  if (data.shortName && data.shortName.length > 6) {
    throw new Error('Short name must be less than 6 characters.');
  }

  if (data.season && !validateSeason(data.season)) {
    throw new Error('Season format must be YYYY/YYYY.');
  }

  if (data.homeLocation && data.homeLocation.length > 30) {
    throw new Error('Home location must be less than 30 characters.');
  }
};

// POST: Create or update the settings
export async function POST(request: Request) {
  try {
    const data: SettingsData = await request.json(); // Parse request body

    // Validate the data before saving
    validateSettings(data);

    // Update or create settings in the database, including the image
    let settings = await prisma.settings.update({
      where: { id: 1 }, // Assuming you're updating the first record
      data,
    });

    // If no settings are found, create new ones
    if (!settings) {
      settings = await prisma.settings.create({
        data: { ...data, id: 1 },
      });
    }

    return NextResponse.json(settings, { status: 201 }); // Respond with the created/updated settings

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}

// GET: Fetch the settings
export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json(settings, { status: 200 }); // Respond with the fetched settings
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
  }
}

// Handle unsupported methods
export async function OPTIONS() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
