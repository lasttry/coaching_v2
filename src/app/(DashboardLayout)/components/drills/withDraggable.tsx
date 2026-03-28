import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  WrappedComponent: React.ComponentType<P>
): React.FC<P & DraggableProps> => {
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
    const handlersRef = useRef<{
      handleMouseMove: ((event: MouseEvent) => void) | null;
      handleMouseUp: (() => void) | null;
    }>({ handleMouseMove: null, handleMouseUp: null });

    useEffect(() => {
      if (elementRef.current) {
        const svgElement = elementRef.current.closest('svg');
        if (svgElement) {
          const rect = svgElement.getBoundingClientRect();
          setSvgRect(rect);
        }
      }
      setPosition({ x, y, rotation: rotation || 0 });
      latestPosition.current = { x, y, rotation: rotation || 0 };
    }, [x, y, rotation]);

    useEffect(() => {
      return () => {
        if (handlersRef.current.handleMouseMove) {
          window.removeEventListener('mousemove', handlersRef.current.handleMouseMove);
        }
        if (handlersRef.current.handleMouseUp) {
          window.removeEventListener('mouseup', handlersRef.current.handleMouseUp);
        }
      };
    }, []);

    const handleMouseMove = useCallback(
      (event: MouseEvent): void => {
        if (draggingRef.current && svgRect) {
          const { left, top } = svgRect;
          const newX = event.clientX - left;
          const newY = event.clientY - top;

          setPosition((prevPosition) => {
            const newPosition = { ...prevPosition, x: newX, y: newY };
            latestPosition.current = newPosition;
            return newPosition;
          });
        } else if (rotatingRef.current && svgRect) {
          const { left, top } = svgRect;
          const centerX = left + latestPosition.current.x;
          const centerY = top + latestPosition.current.y;
          const deltaX = event.clientX - centerX;
          const deltaY = event.clientY - centerY;
          const angleRadians = Math.atan2(deltaY, deltaX);
          let angleDegrees = (angleRadians * 180) / Math.PI;
          angleDegrees = (angleDegrees + 90 + 360) % 360;

          setPosition((prevPosition) => {
            const newPosition = { ...prevPosition, rotation: angleDegrees };
            latestPosition.current = newPosition;
            return newPosition;
          });
        }
      },
      [svgRect]
    );

    const handleMouseUp = useCallback((): void => {
      if (draggingRef.current) {
        draggingRef.current = false;
        if (handlersRef.current.handleMouseMove) {
          window.removeEventListener('mousemove', handlersRef.current.handleMouseMove);
        }
        if (handlersRef.current.handleMouseUp) {
          window.removeEventListener('mouseup', handlersRef.current.handleMouseUp);
        }
      } else if (rotatingRef.current) {
        rotatingRef.current = false;
        if (handlersRef.current.handleMouseMove) {
          window.removeEventListener('mousemove', handlersRef.current.handleMouseMove);
        }
        if (handlersRef.current.handleMouseUp) {
          window.removeEventListener('mouseup', handlersRef.current.handleMouseUp);
        }
      }
      if (onMove) {
        const { x, y, rotation } = latestPosition.current;
        onMove(x, y, rotation || 0, { id });
      }
      if (draggable) {
        select(id);
      }
    }, [onMove, id, draggable, select]);

    useEffect(() => {
      handlersRef.current = { handleMouseMove, handleMouseUp };
    }, [handleMouseMove, handleMouseUp]);

    const handleMouseDown = (event: React.MouseEvent<SVGGElement, MouseEvent>): void => {
      if (draggable && !rotatingRef.current) {
        event.preventDefault();
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        draggingRef.current = true;
      }
    };

    const handleRotateStart = (event: React.MouseEvent<SVGGElement, MouseEvent>): void => {
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
          <WrappedComponent {...(props as P)} id={id} />
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
