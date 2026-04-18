import React, { useState } from 'react';
import { Layer, Group, Text, Circle } from 'react-konva';

interface Element {
  x: number;
  y: number;
  radius: number;
  fill?: string;
  stroke?: string;
  text?: string;
}

interface DrawObjectsProps {
  elements: Element[];
  selectedId: number | null;
  onUpdate: (updatedElements: Element[]) => void;
  handleSelect: (index: number) => void;
  handleDragMove: (index: number, position: { x: number; y: number }) => void;
}

export const DrawObjects: React.FC<DrawObjectsProps> = ({ elements, onUpdate }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = (id: number): void => {
    setSelectedId(id);
  };

  const handleDragMove = (index: number, position: { x: number; y: number }): void => {
    const updatedElements = elements.map((el, idx) =>
      idx === index ? { ...el, x: position.x, y: position.y } : el
    );
    onUpdate(updatedElements);
  };

  return (
    <Layer>
      {elements.map((element, index) => (
        <Group
          key={index}
          draggable
          x={element.x}
          y={element.y}
          onClick={() => handleSelect(index)}
          onDragMove={(e) => handleDragMove(index, e.target.position())}
        >
          {/* Circle */}
          <Circle
            x={0}
            y={0}
            radius={element.radius}
            fill={element.fill || '#FFFFFF'}
            stroke={selectedId === index ? '#00FF00' : element.stroke || '#003366'}
            strokeWidth={2}
            style={{ cursor: 'pointer' }}
          />
          {/* Text */}
          <Text
            text={element.text || '1'}
            x={-4} // Adjust positioning as needed
            y={-6}
            fontSize={14}
            fontFamily="Arial"
            fontStyle="bold"
            fill="#000000"
            listening={false} // Ensure the text does not block click events
            pointerEvents="none"
          />
        </Group>
      ))}
    </Layer>
  );
};
