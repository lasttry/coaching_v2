import React, { ReactElement } from 'react';
import { useDraggable } from './useDraggable';

interface DraggableProps {
  id: string;
  x?: number;
  y?: number;
  rotation?: number;
  color?: string;
  selectable?: boolean;
  selected?: boolean;
  draggable?: boolean;
  rotatable?: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x?: number, y?: number) => void;
}

const WithDraggable = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): ReactElement => {
  const DraggableComponent: React.FC<P & DraggableProps> = ({
    id,
    x,
    y,
    rotation,
    selectable = false,
    selected = false,
    draggable = false,
    rotatable = false,
    onSelect,
    onMove,
    ...props
  }) => {
    const { gRef, position, handleMouseDownMove, handleMouseDownRotate, handleMouseUp } =
      useDraggable(id, { x, y, rotation }, { draggable, rotatable }, onMove);

    const handleClick = (): void => {
      if (selectable) onSelect(id);
    };

    return (
      <g
        ref={gRef}
        transform={`translate(${position.x || 0},${position.y || 0}) ${position.rotation !== undefined ? `rotate(${position.rotation}, 0, 0)` : ''}`}
        style={{ userSelect: 'none', cursor: 'grab' }}
        stroke={props.color}
        fill={props.color}
        onMouseUp={handleMouseUp}
      >
        <WrappedComponent {...(props as P)} onClick={handleClick} />
        {selectable && selected && (
          <>
            <circle cx={0} cy={0} r={2} stroke="red" strokeWidth={2} fill="white" />
            <circle cx={0} cy={0} r={5} fill="transparent" onMouseDown={handleMouseDownMove} />
          </>
        )}
        {rotatable && selected && (
          <path
            d="m 0,-23 l 3,6 -6,0 z"
            fill="#ffffff"
            stroke="#ff0000"
            strokeWidth={1}
            onMouseDown={handleMouseDownRotate}
            style={{ cursor: 'pointer' }}
          />
        )}
      </g>
    );
  };

  return DraggableComponent;
};

export default WithDraggable;
