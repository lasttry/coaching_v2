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
import PlayerIcon from '@/app/(DashboardLayout)/components/drills/PlayerIcon';
import BasketballCourtSVG from '@/app/(DashboardLayout)/components/drills/BasketballCourtSVG';
import {
  DrawingType,
  DrawingInterface,
  LineInterface,
  PlayerInterface,
  PlayerType,
} from './types';
import { v4 as uuidv4 } from 'uuid';
import {
  SvgDefsProvider,
  useSvgDefs,
} from '@/app/(DashboardLayout)/components/drills/SvgDefsProvider';
import { SelectionProvider } from '@/app/(DashboardLayout)/components/drills/SelectionContext';

const Drills_v2: React.FC = () => {
  const { settings } = useSettings();

  // State variables
  const [designFullCourt, setDesignFullCourt] = useState(true);
  const [offensiveNumber, setOffensiveNumber] = useState<number>(1);
  const [defensiveNumber, setDefensiveNumber] = useState<number>(1);
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
  const [players, setPlayers] = useState<PlayerInterface[]>(
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
      if (drawing.type === DrawingType.Offensive || drawing.type === DrawingType.Defensive) {
        setPlayers((prevPlayers) => [
          ...prevPlayers,
          {
            id: uuidv4(),
            number: drawing.value ?? '1',
            x,
            y,
            rotation: 0,
            type: drawing.type === DrawingType.Offensive ? PlayerType.Offensive : PlayerType.Defensive,
          },
        ]);
      }
      const newNumber = ((Number(drawing.value) + 1 - 1) % 9) + 1;
      if(drawing.type === DrawingType.Offensive)
        setOffensiveNumber(newNumber)
      else if(drawing.type === DrawingType.Defensive)
        setDefensiveNumber(newNumber)
      drawing.value = String(newNumber);
    }
  };

  const handleMove = (
    x: number, y: number, rotation: number, additionalProps?: { id: string }
  ) => {
    console.log("handle move")
    console.log({x, y, rotation, additionalProps})
    if (additionalProps?.id) {
      const id = additionalProps.id;

      // Check if the id exists in offensivePlayers
      const playerExists = players.some(
        (player) => player.id === id,
      );
      if (playerExists) {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player) =>
            player.id === id ? { ...player, x, y, rotation } : player,
          ),
        );
        console.log(
          `Moved offensive player ${id} to the position x:${x} and y:${y} in rotation:${rotation}`,
        );
        return;
      }
      console.log(`Player with id ${id} not found`);
    }
  };

  return (
    <Box>
      <SvgDefsProvider>
      <SelectionProvider>
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
            value={offensiveNumber}
            type="offense"
            onClick={() =>
              setDrawing((prev) => ({
                ...prev,
                type: DrawingType.Offensive,
                showCircle: true,
                value: String(offensiveNumber),
              }))
            }
            onValueChange={(value: number) => {
              setOffensiveNumber(value);
              if (drawing.type === DrawingType.Offensive) {
                setDrawing((prev) => ({
                  ...prev,
                  value: value.toString(),
                }));
              }
            }}
          />
          <PlayerButton
            type="defense"
            value={defensiveNumber}
            onClick={() =>
              setDrawing((prev) => ({
                ...prev,
                type: DrawingType.Defensive,
                showCircle: true,
                value: String(defensiveNumber)
              }))
            }
            onValueChange={(value: number) => {
              setDefensiveNumber(value);
              if (drawing.type === DrawingType.Defensive) {
                setDrawing((prev) => ({
                  ...prev,
                  value: value.toString(),
                }));
              }
            }}
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
            {players.map((player, index) => (
              <PlayerIcon
                key={index}
                type={player.type === PlayerType.Offensive ? "offense" : "defense"}
                value={Number(player.number)}
                x={player.x}
                y={player.y}
                id={player.id}
                rotatable={player.type === PlayerType.Defensive ? true : false}
                rotation={player.rotation}
                onMove={handleMove}
              />
            ))}
          </g>
        </svg>
        </SelectionProvider>
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
