'use client';

import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import GameComponent from './Game';
import { GameInterface } from '@/types/games/types';
import { useSession } from 'next-auth/react';

interface GamesAddProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  onAddGame: (game: GameInterface) => void;
}

const GamesAddComponent: React.FC<GamesAddProps> = ({
  setErrorMessage,
  setSuccessMessage,
  onAddGame,
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [isAccordionExpanded, setAccordionExpanded] = useState(false);
  const [newGame, setNewGame] = useState<GameInterface>({
    id: null,
    clubId: session?.user.selectedClubId ?? 0,
    date: new Date(),
    away: false,
    gameAthletes: [],
    opponent: undefined,
    opponentId: null,
  });

  const reset = (): void => {
    setNewGame({
      id: null,
      clubId: session?.user.selectedClubId ?? 0,
      date: new Date(),
      away: false,
      gameAthletes: [],
      opponent: undefined,
      opponentId: null,
    });
    setAccordionExpanded(false);
  }

  const handleOnCancel = (): void => {
    reset();
  };

  const handleAddGame = (game: GameInterface): void => {
    if (onAddGame) onAddGame(game);
    reset();
  }

  return (
    <Accordion
      expanded={isAccordionExpanded}
      onChange={() => setAccordionExpanded(!isAccordionExpanded)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography><span suppressHydrationWarning>{t('addNewGame')}</span></Typography>
      </AccordionSummary>
      <AccordionDetails>
        <GameComponent
          game={newGame}
          setGame={setNewGame}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
          onSave={handleAddGame}
          onCancel={handleOnCancel}
        ></GameComponent>
      </AccordionDetails>
    </Accordion>
  );
};

GamesAddComponent.displayName = 'GamesAddComponent';
export default GamesAddComponent;
