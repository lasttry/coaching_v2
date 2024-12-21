/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PlayerIcon from './PlayerIcon';

interface IconProps {
  onClick?: () => void;
}

interface PointerIconProps extends IconProps {
  fill?: string; // Custom fill color (optional)
}

// PointerIcon Component
export const PointerIcon: React.FC<PointerIconProps> = React.memo(
  ({ fill = '#000000', onClick }) => {
    return (
      <svg
        onClick={onClick}
        width="30"
        height="30"
        viewBox="0 0 30 30"
        xmlns="http://www.w3.org/2000/svg"
        className={onClick ? 'pointer-icon clickable' : 'pointer-icon'}
      >
        <defs>
          <path
            d="M11,10 L11,21.5 C11.6,20.5 12.2,19.5 13,19 L15,24.5 L17,24 L15,18.5 C16,18.5 17.5,18.5 19,19"
            id="arrow-path"
          />
        </defs>
        <g>
          {/* Background Layer */}
          <use
            href="#arrow-path"
            fill="#cccccc"
            transform="translate(1, 0.5)"
          />
          {/* Foreground Layer */}
          <use href="#arrow-path" fill={fill} />
        </g>
      </svg>
    );
  },
);
PointerIcon.displayName = 'PointerIcon';

export const LineMovement: React.FC<IconProps> = React.memo(({ onClick }) => {
  return (
    <svg
      onClick={onClick}
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      className={
        onClick ? 'line-movement-icon clickable' : 'line-movement-icon'
      }
      style={{ overflow: 'hidden' }}
    >
      <desc>Created with Snap</desc>
      <defs></defs>
      <line
        x1="5"
        x2="25"
        y1="17"
        y2="17"
        stroke="#000000"
        style={{ strokeWidth: 2 }}
      />
      <path
        d="m 26,17 -5,-5 0,10 z"
        fill="#000000"
        style={{ strokeWidth: 0 }}
      />
    </svg>
  );
});
LineMovement.displayName = 'LineMovement';

// OffensivePlayerIcon Component
interface PlayerIconProps extends IconProps {
  value?: number;
  type: string;
  x?: number;
  y?: number;
  onValueChange?: (value: number) => void;
}

export const PlayerButton: React.FC<PlayerIconProps> = React.memo(
  ({ value = 1, type = 'ofense', onClick, onValueChange }) => {
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
      setCurrentValue(value);
    }, [value]);

    const handleClick = () => {
      if (onClick) onClick();
      if (onValueChange) onValueChange(currentValue);
    };

    const handleChange = (delta: number) => {
      const newValue = ((currentValue - 1 + delta + 9) % 9) + 1;
      setCurrentValue(newValue);
      if (onValueChange) onValueChange(newValue);
    };

    return (
      <svg
        onClick={handleClick}
        width="30"
        height="30"
        viewBox="-2 0 32 42"
        className="offensive-player-icon clickable"
        style={{ overflow: 'hidden', userSelect: 'none' }}
      >
        <PlayerIcon
          value={currentValue}
          x={15}
          y={16}
          draggable={false}
          id="bttPlayerIcon"
          type={type}
        />

        {/* Left Arrow */}
        <g>
          <rect
            x="-3"
            y="31"
            width="17"
            height="11"
            fill="transparent"
            stroke="#dfdfdf"
            style={{ strokeWidth: 1, cursor: 'pointer' }}
            onClick={() => handleChange(-1)}
          />
          <path
            d="m 8,34 -4,2 4,2"
            fill="transparent"
            stroke="#000000"
            style={{ strokeWidth: 1, cursor: 'pointer' }}
          />
        </g>

        {/* Right Arrow */}
        <g>
          <rect
            x="14"
            y="31"
            width="17"
            height="11"
            fill="transparent"
            stroke="#dfdfdf"
            style={{ strokeWidth: 1, cursor: 'pointer' }}
            onClick={() => handleChange(1)}
          />
          <path
            d="m 21,34 4,2 -4,2"
            fill="transparent"
            stroke="#000000"
            style={{ strokeWidth: 1, cursor: 'pointer' }}
          />
        </g>
      </svg>
    );
  },
);
PlayerButton.displayName = 'PlayerButton';

interface FollowMouseCircleProps {
  visible: boolean;
  onClick: (x: number, y: number) => void;
}

export const FollowMouseCircle: React.FC<FollowMouseCircleProps> = ({
  visible,
  onClick,
}) => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const gRef = useRef<SVGGElement>(null);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const svgElement = gRef.current?.closest('svg');
    if (svgElement) {
      const svgRect = svgElement.getBoundingClientRect();
      const x = event.clientX - svgRect.left;
      const y = event.clientY - svgRect.top;
      setMousePosition({ x, y });
    }
  }, []);

  useEffect(() => {
    if (visible) {
      const handleMouseMoveThrottled = (event: MouseEvent) => {
        requestAnimationFrame(() => handleMouseMove(event));
      };

      window.addEventListener('mousemove', handleMouseMoveThrottled);

      return () => {
        window.removeEventListener('mousemove', handleMouseMoveThrottled);
      };
    }
  }, [handleMouseMove, visible]);

  const handleClick = (
    event: React.MouseEvent<SVGCircleElement, MouseEvent>,
  ) => {
    event.stopPropagation(); // Prevent the event from bubbling up to parent elements
    console.log('icon->FollowMouseCircle->handleClick');
    onClick(mousePosition.x, mousePosition.y);
  };

  return (
    <g ref={gRef} className="overlayGroup">
      {visible && (
        <circle
          cx={mousePosition.x}
          cy={mousePosition.y}
          r="10"
          stroke="#008000"
          fill="transparent"
          className="follow-mouse-circle"
          onClick={handleClick}
        />
      )}
    </g>
  );
};
FollowMouseCircle.displayName = 'FollowMouseCircle';

export const CourtIcon: React.FC<IconProps> = React.memo(({ onClick }) => {
  return (
    <svg
      onClick={onClick}
      version="1.1"
      width="30"
      height="50"
      viewBox="0 0 30 50"
      style={{ overflow: 'hidden' }}
    >
      {/* Top Blue Rectangle */}
      <rect x="0" y="0" width="30" height="25" fill="#0089cf" />
      {/* Bottom Grey Rectangle */}
      <rect x="0" y="25" width="30" height="25" fill="#cccccc" />
      {/* White Lines and Circles */}
      <g fill="none" stroke="#ffffff" strokeWidth="2">
        {/* Top Line */}
        <line x1="4" x2="26" y1="4" y2="4" />
        <line x1="15" x2="15" y1="4" y2="8.5" />
        <circle cx="15" cy="12" r="4" />
        {/* Bottom Line */}
        <line x1="4" x2="26" y1="46" y2="46" />
        <line x1="15" x2="15" y1="41.5" y2="46" />
        <circle cx="15" cy="38" r="4" />
      </g>
    </svg>
  );
});
CourtIcon.displayName = 'CourtIcon';
