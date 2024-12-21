import React, { useState, useEffect, useRef } from 'react';
import { useSelection } from './SelectionContext';

interface DraggableProps {
  fill?: string;
  stroke?: string;
  x: number;
  y: number;
  rotation?: number;
  id: string;
  onMove?: (x: number, y: number, rotation: number, additionalProps?: { id: string }) => void;
  draggable?: boolean;
  rotatable?: boolean;
  selectable?: boolean;
}

const withDraggable = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const DraggableComponent: React.FC<P & DraggableProps> = ({
    x,
    y,
    rotation,
    id,
    onMove,
    draggable = true,
    rotatable = true,
    fill = '#003366',
    stroke = '#003366',
    ...props
  }) => {
    const { selectedId, select } = useSelection();
    const elementRef = useRef<SVGGElement | null>(null);
    const [position, setPosition] = useState({ x, y, rotation });
    const latestPosition = useRef({ x, y, rotation });
    const draggingRef = useRef(false);
    const rotatingRef = useRef(false);
    const [svgRect, setSvgRect] = useState<DOMRect | null>(null);

    useEffect(() => {
      if (elementRef.current) {
        // Find the closest parent <svg> element
        const svgElement = elementRef.current.closest('svg');
        if (svgElement) {
          // Get the bounding box of the <svg> element
          const rect = svgElement.getBoundingClientRect();
          setSvgRect(rect);
        }
      }
      setPosition({ x, y, rotation: rotation || 0 });
      latestPosition.current = { x, y, rotation: rotation || 0 };
    }, [x, y, rotation]);

    const handleMouseDown = (
      event: React.MouseEvent<SVGGElement, MouseEvent>,
    ) => {
      if (draggable && !rotatingRef.current) {
        event.preventDefault();
        // Add global event listeners for mousemove and mouseup
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        draggingRef.current = true;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (draggingRef.current && svgRect) {
        const { left, top } = svgRect; // Use cached bounding rect
        const newX = event.clientX - left;
        const newY = event.clientY - top;

        // Update position only if it changes significantly
        setPosition((prevPosition) => {
          const newPosition = { ...prevPosition, x: newX, y: newY };
          latestPosition.current = newPosition;
          return newPosition;
        });
      } else if (rotatingRef.current && svgRect) {
        // Get the SVG element
        const { left, top } = svgRect;

        // Find the center of the SVG in viewport coordinates
        const centerX = left + position.x;
        const centerY = top + position.y;
        const deltaX = event.clientX - centerX;
        const deltaY = event.clientY - centerY;
        const angleRadians = Math.atan2(deltaY, deltaX);
        let angleDegrees = (angleRadians * 180) / Math.PI;
        angleDegrees = (angleDegrees + 90 + 360) % 360;
        // Set the updated rotation
        setPosition((prevPosition) => {
          const newPosition = { ...prevPosition, rotation: angleDegrees };
          latestPosition.current = newPosition;
          return newPosition;
        });
      }
    };

    const handleMouseUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      } else if (rotatingRef.current) {
        rotatingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
      if (onMove) {
        const { x, y, rotation } = latestPosition.current;
        onMove(x, y, rotation || 0, { id });
      }
      if (draggable) {
        select(id); // Select the component when mouse down
      }
    };

    const handleRotateStart = (
      event: React.MouseEvent<SVGGElement, MouseEvent>,
    ) => {
      if (rotatable) {
        event.preventDefault();
        rotatingRef.current = true;
        draggingRef.current = false;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    return (
      <g
        ref={elementRef}
        transform={`translate(${position.x},${position.y}) ${position.rotation !== undefined ? `rotate(${position.rotation}, 0, 0)` : ''}`}
        style={{ userSelect: 'none', cursor: 'grab' }}
        stroke={stroke}
        fill={fill}
      >
        <g onMouseDown={handleMouseDown}>
          <WrappedComponent {...(props as P)} />
        </g>

        {rotatable && selectedId === id && (
          <path
            d="m 0,-23 l 3,6 -6,0 z"
            fill="#ffffff"
            stroke="#ff0000"
            strokeWidth={1}
            onMouseDown={handleRotateStart}
            style={{ cursor: 'pointer' }}
            className="hide-on-export"
          ></path>
        )}
      </g>
    );
  };

  return DraggableComponent;
};

export default withDraggable;
