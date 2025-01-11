import { useState, useEffect } from 'react';
import React from 'react';
import withDraggable from './withDraggable';
import { useSvgDefs } from '@/app/(DashboardLayout)/components/drills/SvgDefsProvider';
import { useSelection } from './SelectionContext';

interface LineMovementProps {
  id: string;
  points: number[];
}

const LineMovement: React.FC<LineMovementProps> = ({ id, points }) => {
  const { addDef, hasDef } = useSvgDefs();
  const [updateSvgDefs, setUpdateSvgDefs] = useState<boolean>(false);
  const { selectedId, select } = useSelection();
  const [currentPoints, setCurrentPoints] = useState<number[]>(points);

  useEffect(() => {
    if (!hasDef('markerArrow')) {
      addDef(
        'markerArrow',
        <marker
          viewBox="0 0 8 6"
          markerWidth="8"
          markerHeight="6"
          orient="auto"
          refX="4"
          refY="3"
          id="markerArrow"
        >
          <path d="m 8,3 -8,3 0,-6 8,3 z" fill="#000000" strokeWidth={0}></path>
        </marker>,
      );
    }
    setUpdateSvgDefs(true);
  }, [updateSvgDefs]);

  const generatePathFromPoints = (points: number[]): string => {
    if (points.length < 2) return '';

    // Calculate the offset
    const offsetX = points[0];
    const offsetY = points[1];

    // Adjust the points
    const adjustedPoints = points.map((value, index) =>
      index % 2 === 0 ? value - offsetX : value - offsetY,
    );

    // Generate the path
    let path = `M 0,0`; // First point is always (0,0)
    for (let i = 2; i < adjustedPoints.length; i += 4) {
      if (i + 3 < adjustedPoints.length) {
        path += ` Q ${adjustedPoints[i]},${adjustedPoints[i + 1]} ${adjustedPoints[i + 2]},${adjustedPoints[i + 3]}`;
      } else {
        path += ` L ${adjustedPoints[i]},${adjustedPoints[i + 1]}`;
      }
    }

    console.log(path);
    return path;
  };

  return (
    <g>
      {console.log('Selected ID:', selectedId)}
      {console.log('ID:', id)}
      <path
        className={id}
        d={generatePathFromPoints(points)}
        fill="none"
        stroke={'black'}
        strokeWidth={2}
        markerEnd="url(#markerArrow)"
      />
      {selectedId === id &&
        currentPoints.map(
          (point, index) =>
            index % 2 === 0 && (
              <circle
                key={index}
                cx={point}
                cy={currentPoints[index + 1]}
                r={4}
                fill="red"
              />
            ),
        )}
    </g>
  );
};

export default withDraggable(LineMovement);
