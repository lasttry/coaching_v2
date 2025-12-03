import { GameInterface } from '@/types/game/types';

// Utility function to validate the request payload
export const validateGameData = (data: GameInterface): string[] => {
  const errors: string[] = [];

  if (!data.number) errors.push('Game number is required');
  if (isNaN(Number(data.number))) errors.push('Game number is not a number');

  // ✅ Handle both Date and string formats safely
  const dateValue = typeof data.date === 'string' ? data.date : data.date?.toISOString();

  if (!dateValue || isNaN(Date.parse(dateValue))) {
    errors.push('Game date is invalid.');
  }

  // Validate opponent
  if (!data.opponentId || typeof data.opponentId !== 'number') {
    errors.push('Game opponent is invalid');
  }

  return errors;
};
