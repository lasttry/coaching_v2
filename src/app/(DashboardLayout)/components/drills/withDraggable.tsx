import React, { useState, useEffect, useRef } from 'react';

interface DraggableProps {
  fill?: string;
  stroke?: string;
  x: number;
  y: number;
  onMove?: (x: number, y: number, additionalProps?: { id: string }) => void;
  draggable?: boolean;
}

const withDraggable = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const DraggableComponent: React.FC<P & DraggableProps> = ({
    x,
    y,
    onMove,
    draggable = true,
    fill = '#003366',
    stroke = '#003366',
    ...props
  }) => {
    const [position, setPosition] = useState({ x, y });
    const [rotation, setRotation] = useState(0);
    const [selected, setSelected] = useState(false);
    const draggingRef = useRef(false);
    const rotatingRef = useRef(false);
    const svgRectRef = useRef<DOMRect | null>(null);

    useEffect(() => {
      setPosition({ x, y });
    }, [x, y]);

    const handleMouseDown = (
      event: React.MouseEvent<SVGGElement, MouseEvent>,
    ) => {
      console.log('test');
      if (draggable) {
        event.preventDefault();
        // Add global event listeners for mousemove and mouseup
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        svgRectRef.current =
          event.currentTarget.closest('svg')?.getBoundingClientRect() || null;
        draggingRef.current = true;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!svgRectRef) console.log('null');
      if (!draggingRef.current || !svgRectRef.current) return;

      const { left, top } = svgRectRef.current; // Use cached bounding rect
      const newX = event.clientX - left;
      const newY = event.clientY - top;

      // Update position only if it changes significantly
      setPosition((prev) => {
        if (Math.abs(prev.x - newX) > 0.1 || Math.abs(prev.y - newY) > 0.1) {
          return { x: newX, y: newY };
        }
        return prev;
      });
    };

    const handleMouseUp = () => {
      if (draggingRef.current) {
        svgRectRef.current = null; // Clear cached rect
        draggingRef.current = false;

        // Remove global event listeners when dragging stops
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        // Final onMove call to ensure the last position is registered
        if (onMove) onMove(position.x, position.y, { id: (props as any).id });
      }
    };

    return (
      <g
        transform={`matrix(1,0,0,1,${position.x},${position.y}) rotate(${rotation})`}
        onMouseDown={handleMouseDown}
        style={{ userSelect: 'none', cursor: 'grab' }}
        stroke={stroke}
        fill={fill}
      >
        <WrappedComponent {...(props as P)} />
        <path
          d="m 0,-23 l 3,6 -6,0 z"
          fill="#ffffff"
          stroke="#ff0000"
          strokeWidth={1}
          style={{ cursor: 'pointer' }}
          className="hide-on-export"
        ></path>
      </g>
    );
  };

  return DraggableComponent;
};

export default withDraggable;
