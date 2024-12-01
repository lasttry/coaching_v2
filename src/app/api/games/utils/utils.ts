import { GameInterface } from '@/types/games/types';

// Utility function to validate the request payload
export const validateGameData = (data: GameInterface): string[] => {
  const errors: string[] = [];

  if (!data.number)
    errors.push('Game number is required.')
  if(isNaN(Number(data.number)))
    errors.push('Game number is not a number')
  // Validate date
  if (!data.date || isNaN(Date.parse(data.date))) {
    errors.push('Valid game date is required.');
  }

  // Validate opponent
  if (!data.oponentId || typeof data.oponentId !== 'number') {
    errors.push('Valid opponent ID is required.');
  }

  return errors;
};