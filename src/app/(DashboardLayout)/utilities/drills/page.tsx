'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, Stack, Button, Select, MenuItem, TextField } from '@mui/material';
import { Stage, Layer, Line, Circle, Text } from 'react-konva';


const BasketballDrillPage = () => {
  const [elements, setElements] = useState<any[]>([]); // Store all added elements
  const [drawingMode, setDrawingMode] = useState('none'); // Current drawing mode
  const [playerNumber, setPlayerNumber] = useState(''); // Player number for circle
  const [lineType, setLineType] = useState('solid'); // Type of line
  const [isDrawing, setIsDrawing] = useState(false); // To track line drawing
  const [currentLine, setCurrentLine] = useState<any>(null); // Current line being drawn

  const handleAddPlayer = () => {
    if (!playerNumber) return;
    setElements((prev) => [
      ...prev,
      {
        type: 'player',
        x: 150,
        y: 150,
        radius: 20,
        text: playerNumber,
        fill: '#FF4500',
      },
    ]);
    setPlayerNumber('');
  };

  const handleStartDrawing = (e: any) => {
    if (drawingMode === 'line') {
      const pos = e.target.getStage().getPointerPosition();
      const newLine = {
        type: 'line',
        points: [pos.x, pos.y],
        stroke: 'black',
        strokeWidth: 3,
        lineCap: 'round',
        lineJoin: 'round',
        dash: lineType === 'dashed' ? [10, 5] : undefined,
      };
      setCurrentLine(newLine);
      setElements((prev) => [...prev, newLine]);
      setIsDrawing(true);
    }
  };

  const handleDrawing = (e: any) => {
    if (!isDrawing) return;
    const pos = e.target.getStage().getPointerPosition();
    const updatedLine = {
      ...currentLine,
      points: [...currentLine.points, pos.x, pos.y],
    };
    setCurrentLine(updatedLine);
    setElements((prev) => [...prev.slice(0, -1), updatedLine]);
  };

  const handleStopDrawing = () => {
    if (isDrawing) setIsDrawing(false);
  };

  const saveDrill = async () => {
    const stage = document.querySelector('#stage-container') as HTMLDivElement;
    const svgContent = stage.querySelector('svg')?.outerHTML || '';

    const response = await fetch('/api/save-drill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ svgContent }),
    });

    if (response.ok) {
      alert('Drill saved successfully!');
    } else {
      alert('Failed to save drill.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Basketball Drill Editor
      </Typography>

      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="outlined" onClick={() => setDrawingMode('line')}>
          Draw Line
        </Button>
        <Button variant="outlined" onClick={() => setDrawingMode('player')}>
          Add Player
        </Button>
        <Button variant="outlined" onClick={saveDrill}>
          Save Drill
        </Button>
        <Select
          value={lineType}
          onChange={(e) => setLineType(e.target.value)}
          disabled={drawingMode !== 'line'}
        >
          <MenuItem value="solid">Solid Line</MenuItem>
          <MenuItem value="dashed">Dashed Line</MenuItem>
          <MenuItem value="wiggly">Wiggly Line</MenuItem>
        </Select>
        {drawingMode === 'player' && (
          <TextField
            label="Player Number"
            value={playerNumber}
            onChange={(e) => setPlayerNumber(e.target.value)}
            style={{ width: '100px' }}
          />
        )}
      </Stack>

      <Stage
        id="stage-container"
        width={800}
        height={600}
        style={{ border: '1px solid black' }}
        onMouseDown={handleStartDrawing}
        onMouseMove={handleDrawing}
        onMouseUp={handleStopDrawing}
      >
        <Layer>
          {elements.map((el, index) => {
            if (el.type === 'line') {
              return <Line key={index} {...el} />;
            }
            if (el.type === 'player') {
              return (
                <React.Fragment key={index}>
                  <Circle x={el.x} y={el.y} radius={el.radius} fill={el.fill} draggable />
                  <Text
                    x={el.x - 10}
                    y={el.y - 10}
                    text={el.text}
                    fontSize={16}
                    fontStyle="bold"
                    fill="#FFF"
                    draggable
                  />
                </React.Fragment>
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </Box>
  );
};

export default BasketballDrillPage;
