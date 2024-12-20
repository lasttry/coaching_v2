'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useSettings } from '@/context/SettingsContext';
import {
  PointerIcon,
  CourtIcon,
  PlayerButton,
  LineMovement,
  FollowMouseCircle,
} from '@/app/(DashboardLayout)/components/drills/Icons';
import PlayerIcon from '../../components/drills/PlayerIcon';
import BasketballCourtSVG from '@/app/(DashboardLayout)/components/drills/BasketballCourtSVG';
import {
  DrawingType,
  DrawingInterface,
  LineInterface,
  PlayerInterface,
} from './types';
import { v4 as uuidv4 } from 'uuid';
import {
  SvgDefsProvider,
  useSvgDefs,
} from '@/app/(DashboardLayout)/components/drills/SvgDefsProvider';

const Drills_v2: React.FC = () => {
  const { settings } = useSettings();

  // State variables
  const [designFullCourt, setDesignFullCourt] = useState(true);
  const [drawing, setDrawing] = useState<DrawingInterface>({
    showCircle: false,
    isDrawing: false,
    type: DrawingType.None,
    value: '1',
  });
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [offensivePlayers, setOffensivePlayers] = useState<PlayerInterface[]>(
    [],
  );
  const [defensivePlayers, setDefensivePlayers] = useState<PlayerInterface[]>(
    [],
  );

  const [currentLine, setCurrentLine] = useState<LineInterface | undefined>(); // Line currently being drawn
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(
    null,
  );
  const [linesMovement, setLinesMovement] = useState<LineInterface[]>([]); // Stores all line movements

  // Court dimensions
  const scale = 3;
  const courtBorder = 25;
  const courtWidth = 150 * scale;
  const courtHeight = 280 * scale;
  const stageWidth = useMemo(
    () => courtWidth + courtBorder * 2,
    [courtWidth, courtBorder],
  );
  const stageHeight = useMemo(
    () => courtHeight + courtBorder * 2,
    [courtHeight, courtBorder],
  );

  // Handlers
  const handleCircleClick = (x: number, y: number) => {
    if (!drawing.showCircle && !drawing.isDrawing) return;
    console.log(`Circle clicked at position: (${x}, ${y})`);
    if (
      (drawing.type == DrawingType.Offensive ||
        drawing.type == DrawingType.Defensive) &&
      drawing.showCircle
    ) {
      console.log(drawing.value);
      if (drawing.type == DrawingType.Offensive) {
        setOffensivePlayers((prevPlayers) => [
          ...prevPlayers,
          {
            id: uuidv4(),
            number: drawing.value ?? '1',
            x,
            y,
          },
        ]);
      } else if (drawing.type == DrawingType.Defensive) {
        setDefensivePlayers((prevPlayers) => [
          ...prevPlayers,
          {
            id: uuidv4(),
            number: drawing.value ?? '1',
            x,
            y,
          },
        ]);
      }
      drawing.value = String(((Number(drawing.value) + 1 - 1) % 9) + 1);
    }
  };

  const handleMove = (
    x: number,
    y: number,
    additionalProps?: { id: string },
  ) => {
    console.log(additionalProps?.id);
    if (additionalProps?.id) {
      const id = additionalProps.id;

      // Check if the id exists in offensivePlayers
      const offensivePlayerExists = offensivePlayers.some(
        (player) => player.id === id,
      );
      if (offensivePlayerExists) {
        setOffensivePlayers((prevPlayers) =>
          prevPlayers.map((player) =>
            player.id === id ? { ...player, x, y } : player,
          ),
        );
        console.log(
          `Moved offensive player ${id} to the position x:${x} and y:${y}`,
        );
        return;
      }

      // Check if the id exists in defensivePlayers
      const defensivePlayerExists = defensivePlayers.some(
        (player) => player.id === id,
      );
      if (defensivePlayerExists) {
        setDefensivePlayers((prevPlayers) =>
          prevPlayers.map((player) =>
            player.id === id ? { ...player, x, y } : player,
          ),
        );
        console.log(
          `Moved defensive player ${id} to the position x:${x} and y:${y}`,
        );
        return;
      }

      console.log(`Player with id ${id} not found`);
    }
  };

  return (
    <Box>
      <SvgDefsProvider>
        <Typography variant="h4" gutterBottom>
          Basketball Drill Editor
        </Typography>

        <Stack direction="row" spacing={2} marginBottom={2}>
          <PointerIcon
            onClick={() =>
              setDrawing({
                ...drawing,
                type: DrawingType.None,
                showCircle: false,
              })
            }
          />
          <CourtIcon onClick={() => setDesignFullCourt(!designFullCourt)} />
          <PlayerButton
            value={Number(drawing.value)}
            type="ofense"
            onClick={() =>
              setDrawing((prev) => ({
                ...prev,
                type: DrawingType.Offensive,
                showCircle: true,
              }))
            }
            onValueChange={(value) =>
              setDrawing((prev) => ({ ...prev, value: String(value) }))
            }
          />
          <PlayerButton
            type="defense"
            value={Number(drawing.value)}
            onClick={() =>
              setDrawing((prev) => ({
                ...prev,
                type: DrawingType.Defensive,
                showCircle: true,
              }))
            }
            onValueChange={(value) =>
              setDrawing((prev) => ({ ...prev, value: String(value) }))
            }
          />
          <LineMovement
            onClick={() =>
              setDrawing({ ...drawing, type: DrawingType.LineMovement })
            }
          />
        </Stack>

        <svg
          width={stageWidth}
          height={designFullCourt ? stageHeight / 2 + 25 : stageHeight}
        >
          <SvgDefs />
          <BasketballCourtSVG
            scale={scale}
            stageWidth={stageWidth}
            stageHeight={stageHeight}
            courtHeight={courtHeight}
            courtWidth={courtWidth}
            strokeColor={settings?.foregroundColor}
            fullCourt={designFullCourt}
          />
          <FollowMouseCircle
            visible={drawing.showCircle}
            onClick={handleCircleClick}
          />

          <g className="groupPlayer">
            {offensivePlayers.map((player, index) => (
              <PlayerIcon
                key={index}
                type="offense"
                value={Number(player.number)}
                x={player.x}
                y={player.y}
                id={player.id}
                onMove={handleMove}
              />
            ))}
            {defensivePlayers.map((player, index) => (
              <PlayerIcon
                key={index}
                type="defense"
                value={Number(player.number)}
                x={player.x}
                y={player.y}
                id={player.id}
                onMove={handleMove}
              />
            ))}
          </g>
        </svg>
      </SvgDefsProvider>
    </Box>
  );
};

const SvgDefs: React.FC = () => {
  const { defs } = useSvgDefs();
  return (
    <defs>
      {Object.entries(defs).map(([id, def]) => (
        <React.Fragment key={id}>{def}</React.Fragment>
      ))}
    </defs>
  );
};

export default Drills_v2;
