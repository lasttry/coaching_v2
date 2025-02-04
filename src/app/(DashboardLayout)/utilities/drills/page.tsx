'use client';
import React, { useState, useRef } from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { Stage, Layer, Line, Circle, Group, Path } from 'react-konva';
import { CourtIcon } from '@/app/(DashboardLayout)/components/drills/Icons';
import { PointerIcon, LineMovement } from '@/app/(DashboardLayout)/components/drills/Icons';

import { DrawObjects } from '@/app/(DashboardLayout)/components/drills/DrawObjects';
import BasketballCourt from '@/app/(DashboardLayout)/components/drills/BasketballCourt';
import { useSettings } from '@/context/SettingsContext';

export enum DrawingType {
  Offensive = 'offensive',
  Defensive = 'defensive',
  LineMovement = 'lineMovement',
  LineDribbling = 'lineDribbling',
  LineScreen = 'lineScreen',
  LinePassing = 'linePassing',
  None = 'none',
}

export interface DrawingInterface {
  showCircle: boolean;
  isDrawing: boolean;
  type?: DrawingType;
  value?: string;
}
export interface Line {
  tool: string;
  points: number[];
  startX?: number;
  startY?: number;
}

const BasketballDrillPage = () => {
  const { settings } = useSettings();
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
  const [offensivePlayers, setOffensivePlayers] = useState<any[]>([]);
  // Lines
  const [currentLine, setCurrentLine] = useState<Line>(); // Line currently being drawn
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  // Line Movement
  const [linesMovement, setLinesMovement] = useState<Line[]>([]); // Stores all line movements

  const scale = 3;
  const courtBorder = 25;
  const courtWidth = 150 * scale;
  const courtHeight = 280 * scale;
  const stageWidth = courtWidth + courtBorder * 2;
  const stageHeight = courtHeight + courtBorder * 2;

  const pointsToPath = (line: Line) => {
    if (line.points.length < 4) return ''; // Ensure at least two points exist

    // Start with 'M' for the first point
    let d = `M ${line.points[0]},${line.points[1]}`;

    // Add the first quadratic curve explicitly
    if (line.points.length >= 6) {
      d += ` L ${line.points[2]},${line.points[3]} ${line.points[4]},${line.points[5]}`;
    }

    // Use 'T' for smooth transitions for remaining points
    for (let i = 6; i < line.points.length; i += 2) {
      d += ` L ${line.points[i]},${line.points[i + 1]}`;
    }
    console.log('Generated Path:', d);
    return d;
  };

  const handleAddPlayer = (value: number) => {
    console.log(value);
    setDrawing({
      showCircle: true,
      isDrawing: true,
      type: DrawingType.Offensive,
      value: String(value),
    });
  };
  const handleAddLineMovement = () => {
    setDrawing({
      showCircle: false,
      isDrawing: false,
      type: DrawingType.LineMovement,
    });
    console.log(drawing);
  };

  const handleMouseDown = (e: any) => {
    console.log(drawing);
    if (drawing.isDrawing) return; // already drawing something.

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    console.log(pos);
    if (drawing.type === DrawingType.LineMovement) {
      console.log(pos);
      setCurrentLine({
        tool: 'line',
        points: [pos.x, pos.y],
        startX: pos.x,
        startY: pos.y,
      });
      setDrawing({
        showCircle: false,
        isDrawing: true,
        type: DrawingType.LineMovement,
      });
      setSelectedLineIndex(null); // Deselect other lines
    }
  };

  const handleMouseMove = (e: any) => {
    if (drawing.showCircle) {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      setCursorPosition({ x: pos.x, y: pos.y });
    }
    if (!drawing.isDrawing) return;

    if (drawing.type === DrawingType.LineMovement) {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();

      // Add points if significant distance is moved
      setCurrentLine((prevLine) => {
        if (!prevLine) return prevLine;

        const lastX = prevLine.points[prevLine.points.length - 2];
        const lastY = prevLine.points[prevLine.points.length - 1];

        if (Math.hypot(pos.x - lastX, pos.y - lastY) > 50) {
          return { ...prevLine, points: [...prevLine.points, pos.x, pos.y] };
        }
        return prevLine;
      });
    }
  };
  const handleMouseUp = (e: any) => {
    if (!drawing.isDrawing) return;
    if (currentLine) {
      if (currentLine.points.length > 2) {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        setCurrentLine({
          ...currentLine,
          points: [...currentLine.points, pos.x, pos.y],
        });
        setLinesMovement((prev) => [...prev, currentLine]);
        console.log(linesMovement);
        console.log(currentLine);
      }
      setCurrentLine(undefined);
      setDrawing({ ...drawing, isDrawing: false });
    }
  };

  const handleLineDrag = (index, pos) => {
    setLinesMovement((prevLines) => prevLines.map((line, i) => (i === index ? { ...line, position: pos } : line)));
  };
  const handlePointDrag = (lineIndex, pointIndex, newX, newY) => {
    setLinesMovement((prevLines) =>
      prevLines.map((line, i) =>
        i === lineIndex
          ? {
              ...line,
              points: line.points.map((coord, j) => (j === pointIndex * 2 ? newX : j === pointIndex * 2 + 1 ? newY : coord)),
            }
          : line
      )
    );
  };

  const handleSelectLine = (lineIndex: number) => {
    setSelectedLineIndex(lineIndex);
    resetDrawing();
  };

  const handleAddPoint = (lineIndex, x, y) => {
    setLinesMovement((prevLines) =>
      prevLines.map((line, i) =>
        i === lineIndex
          ? {
              ...line,
              points: [...line.points.slice(0, -2), x, y, ...line.points.slice(-2)],
            }
          : line
      )
    );
  };

  const handleDeletePoint = (lineIndex, pointIndex) => {
    setLinesMovement((prevLines) =>
      prevLines.map((line, i) =>
        i === lineIndex
          ? {
              ...line,
              points: line.points.filter((_, idx) => idx !== pointIndex * 2 && idx !== pointIndex * 2 + 1),
            }
          : line
      )
    );
  };

  const handleCanvasClick = (e: any) => {
    if (drawing.isDrawing && drawing.type == DrawingType.Offensive) {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      setOffensivePlayers((prev) => [
        ...prev,
        {
          type: 'offensive',
          x: pos.x,
          y: pos.y,
          radius: 5 * scale,
          fill: '#FFFFFF',
          stroke: '#003366',
          text: drawing.value,
        },
      ]);
      setDrawing((prev) => ({
        ...prev, // Copy other properties from the previous state
        value: String((Number(prev.value) % 9) + 1), // Increment and reset to 1 after 9
      }));
    }
  };

  const stageRef = useRef<any>(null);

  const saveDrill = async () => {
    const stage = stageRef.current;
    const svgContent = stage?.toDataURL(); // Export as data URL

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

  const resetDrawing = () => {
    setDrawing({
      showCircle: false,
      isDrawing: false,
      type: DrawingType.None,
      value: '',
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Basketball Drill Editor
      </Typography>

      <Stack direction="row" spacing={2} marginBottom={2}>
        <PointerIcon onClick={resetDrawing} />
        <CourtIcon onClick={() => setDesignFullCourt(!designFullCourt)} />
        <PlayerIcon
          initialValue={Number(drawing.value)}
          onClick={handleAddPlayer}
          onValueChange={(val) => setDrawing((prev) => ({ ...prev, value: String(val) }))}
        />
        <LineMovement onClick={handleAddLineMovement} />
        <Button variant="outlined" onClick={() => {}}>
          Draw Line
        </Button>
        <Button variant="outlined" onClick={() => {}}>
          Add Player
        </Button>
        <Button variant="outlined" onClick={saveDrill}>
          Save Drill
        </Button>
      </Stack>

      <Stage
        ref={stageRef}
        width={stageWidth}
        height={designFullCourt ? stageHeight / 2 + 25 : stageHeight}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <BasketballCourt
          scale={scale}
          stageWidth={stageWidth}
          stageHeight={stageHeight}
          courtHeight={courtHeight}
          courtWidth={courtWidth}
          strokeColor={settings?.foregroundColor}
          fullCourt={designFullCourt}
        />

        {drawing.showCircle && (
          <Layer>
            <Circle x={cursorPosition.x} y={cursorPosition.y} radius={5 * scale} stroke="#77B5E1" strokeWidth={2} />
          </Layer>
        )}

        <Layer x={0} y={0} width={stageWidth} height={designFullCourt ? stageHeight / 2 + 25 : stageHeight}>
          {linesMovement.map((line, lineIndex) => (
            <>
              <Group
                key={lineIndex}
                draggable
                x={line?.startX}
                y={line?.startY}
                onDragEnd={(e) => handleLineDrag(lineIndex, e.target.position())}
                onClick={(e) => handleSelectLine(lineIndex)}
              >
                {/* Render the arrowhead */}
                <Path key={`lm_path_${lineIndex}`} data={pointsToPath(line)} fill="black" stroke="black" strokeWidth={3} lineCap="round" lineJoin="round" />

                {/* Add a new point on double-click */}
                {selectedLineIndex === lineIndex && (
                  <Line
                    key={`lm_line_point_${lineIndex}`}
                    points={line.points}
                    tension={0.5}
                    strokeWidth={20}
                    stroke="transparent"
                    onDblClick={(e) => {
                      const stage = e.target.getStage();
                      const pos = stage?.getPointerPosition();
                      handleAddPoint(lineIndex, pos?.x, pos?.y);
                    }}
                  />
                )}

                {/* Editable Points */}
                {selectedLineIndex === lineIndex &&
                  line.points.map((_, idx) => {
                    if (idx % 2 === 0) {
                      return (
                        <Circle
                          key={`lm_line_${lineIndex}_point_${idx}`}
                          x={line.points[idx]}
                          y={line.points[idx + 1]}
                          radius={5}
                          fill="red"
                          draggable
                          onDblClick={() => handleDeletePoint(lineIndex, idx / 2)}
                          onDragMove={(e) => handlePointDrag(lineIndex, idx / 2, e.target.x(), e.target.y())}
                        />
                      );
                    }
                    return null;
                  })}
              </Group>
            </>
          ))}

          {/* Current Line */}
          {currentLine && (
            <Path key={`lm_path_current_line`} data={pointsToPath(currentLine)} fill="none" stroke="black" strokeWidth={3} lineCap="round" lineJoin="round" />
          )}
        </Layer>
        <DrawObjects elements={offensivePlayers} onUpdate={setOffensivePlayers} />
      </Stage>
    </Box>
  );
};

export default BasketballDrillPage;
