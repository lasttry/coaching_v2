import { ClubInterface } from '@/types/club/types';

// Validate season format (YYYY/YYYY)
export const validateSeason = (season: string): boolean => {
  const regex = /^\d{4}\/\d{4}$/;
  return regex.test(season);
};

// Validate hex color codes
export const validateColor = (color: string): boolean => {
  const regex = /^#[0-9A-Fa-f]{6}$/;
  return regex.test(color);
};

// Validate Club settings
export const validateClubSettings = (data: ClubInterface) => {
  if (!data.name || data.name.length > 50) {
    throw new Error(
      'Club name is required and must be less than 50 characters.',
    );
  }

  if (data.shortName && data.shortName.length > 6) {
    throw new Error('Short name must be less than 6 characters.');
  }

  if (data.season && !validateSeason(data.season)) {
    throw new Error('Season format must be YYYY/YYYY.');
  }

  if (data.location && data.location.length > 30) {
    throw new Error('Home location must be less than 30 characters.');
  }

  if (data.backgroundColor && !validateColor(data.backgroundColor)) {
    throw new Error('Background color must be a valid hex color code.');
  }

  if (data.foregroundColor && !validateColor(data.foregroundColor)) {
    throw new Error('Foreground color must be a valid hex color code.');
  }
};
