/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useMousePosition } from './useMousePosition';

export const DefaultColors = [
  '#003366',
  '#FF5733',
  '#FFC300',
  '#28B463',
  '#DAF7A6',
  '#6C3483',
  '#E74C3C',
  '#1F618D',
];

interface IconProps {
  onClick?: () => void;
}

export const ArrowIcon: React.FC<IconProps> = React.memo(({ onClick }) => {
  const handleOnClick = (): void => {
    if (onClick) onClick();
  };
  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{ overflow: 'hidden' }}
      onClick={handleOnClick}
    >
      <defs>
        <path
          d="m 11,10 0,11.5 c 0.6,-1 1.2,-2 2,-2.5 l 2,5.5 2,-0.5 -2,-5.5 c 1,0 2.5,0 4,0.5 z"
          id="path"
        ></path>
      </defs>
      <g>
        <use href="#path" fill="#cccccc" transform="matrix(1,0,0,1,1,0.5)"></use>
        <use href="#path" fill="#000000"></use>
      </g>
    </svg>
  );
});
ArrowIcon.displayName = 'ArrowIcon';

interface OffenseIconProps {
  textValue?: number;
  color?: string;
  x?: number;
  y?: number;
  onClick?: () => void;
}

export const OffenseIcon: React.FC<OffenseIconProps> = React.memo(
  ({ textValue = 1, color = '#003366', x = 0, y = 0, onClick }) => {
    const handleOnClick = (): void => {
      if (onClick) onClick();
    };

    return (
      <g
        transform={`matrix(1,0,0,1,${x},${y})`}
        fill={color}
        stroke={color}
        className="offence"
        onClick={handleOnClick}
      >
        <circle cx="0" cy="0" r="8" fill="#ffffff" style={{ strokeWidth: 2 }}></circle>
        <text
          x="-3.5"
          y="4.5"
          stroke="none"
          style={{
            fontSize: '14px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontWeight: '700',
            pointerEvents: 'none',
          }}
        >
          {textValue}
        </text>
      </g>
    );
  }
);
OffenseIcon.displayName = 'OffenseIcon';

export const OffenseToolbarIcon: React.FC<{
  textValue?: number;
  color?: string;
  onChange?: (value: number) => void;
  onClick?: () => void;
}> = React.memo(({ textValue = 1, color = '#003366', onChange, onClick }) => {
  const handleIncrement = (): void => {
    const newValue = textValue === 9 ? 1 : textValue + 1;
    if (onChange) onChange(newValue);
  };

  const handleDecrement = (): void => {
    const newValue = textValue === 1 ? 9 : textValue - 1;
    if (onChange) onChange(newValue);
  };

  const handleOnClick = (): void => {
    if (onClick) onClick();
  };

  return (
    <svg
      version="1.1"
      width="34"
      height="42"
      viewBox="-2 0 32 42"
      style={{
        overflow: 'hidden',
        userSelect: 'none',
        borderRadius: '8px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <OffenseIcon textValue={textValue} color={color} x={13} y={16} onClick={handleOnClick} />
      <g onClick={handleDecrement} style={{ cursor: 'pointer' }}>
        <rect
          x="-3"
          y="31"
          width="17"
          height="11"
          fill="rgba(0,0,0,0)"
          stroke="#B0BEC5"
          style={{ strokeWidth: 1 }}
        ></rect>
        <path
          d="m 8,34 -4,2 4,2"
          fill="rgba(0,0,0,0)"
          stroke="#37474F"
          style={{ strokeWidth: 1.5 }}
        ></path>
      </g>
      <g onClick={handleIncrement} style={{ cursor: 'pointer' }}>
        <rect
          x="14"
          y="31"
          width="17"
          height="11"
          fill="rgba(0,0,0,0)"
          stroke="#B0BEC5"
          style={{ strokeWidth: 1 }}
        ></rect>
        <path
          d="m 21,34 4,2 -4,2"
          fill="rgba(0,0,0,0)"
          stroke="#37474F"
          style={{ strokeWidth: 1.5 }}
        ></path>
      </g>
    </svg>
  );
});
OffenseToolbarIcon.displayName = 'OffenseIcon';

export const DefenseIcon: React.FC<{
  textValue?: number;
  color?: string;
  onClick: () => void;
}> = React.memo(({ textValue = 1, color = '#003366', onClick }) => {
  const handleOnClick = (): void => {
    if (onClick) onClick();
  };

  return (
    <g
      transform="matrix(0.8,0,0,0.8,15,16)"
      fill={color}
      stroke={color}
      className="defence"
      onClick={handleOnClick}
    >
      <g>
        <path
          d="m -20,10 c 10,-16 30,-16 40,0 -5,-24 -35,-24 -40,0"
          stroke="none"
          style={{ strokeWidth: 0 }}
        ></path>
        <circle cx="0" cy="0" r="7" fill="#ffffff" style={{ strokeWidth: 2 }}></circle>
      </g>
      <text
        x="-3"
        y="4"
        stroke="none"
        style={{
          fontSize: '13px',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          pointerEvents: 'none',
        }}
      >
        {textValue}
      </text>
    </g>
  );
});
DefenseIcon.displayName = 'DefenseIcon';

export const DefenseToolbarIcon: React.FC<{
  textValue?: number;
  color?: string;
  onChange: (value: number) => void;
  onClick: () => void;
}> = React.memo(({ textValue = 1, color = '#455A64', onChange, onClick }) => {
  const handleIncrement = (): void => {
    const newValue = textValue === 9 ? 1 : textValue + 1;
    if (onChange) onChange(newValue);
  };

  const handleDecrement = (): void => {
    const newValue = textValue === 1 ? 9 : textValue - 1;
    if (onChange) onChange(newValue);
  };

  const handleOnClick = (): void => {
    if (onClick) onClick();
  };

  return (
    <svg
      version="1.1"
      width="34"
      height="42"
      viewBox="-2 0 32 42"
      style={{
        overflow: 'hidden',
        userSelect: 'none',
        borderRadius: '6px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <DefenseIcon textValue={textValue} color={color} onClick={handleOnClick} />
      <g onClick={handleDecrement} style={{ cursor: 'pointer' }}>
        <rect
          x="-3"
          y="31"
          width="17"
          height="11"
          fill="rgba(0,0,0,0)"
          stroke="#cfd8dc"
          style={{ strokeWidth: 1 }}
        ></rect>
        <path
          d="m 8,34 -4,2 4,2"
          fill="rgba(0,0,0,0)"
          stroke="#455A64"
          style={{ strokeWidth: 1 }}
        ></path>
      </g>
      <g onClick={handleIncrement} style={{ cursor: 'pointer' }}>
        <rect
          x="14"
          y="31"
          width="17"
          height="11"
          fill="rgba(0,0,0,0)"
          stroke="#cfd8dc"
          style={{ strokeWidth: 1 }}
        ></rect>
        <path
          d="m 21,34 4,2 -4,2"
          fill="rgba(0,0,0,0)"
          stroke="#455A64"
          style={{ strokeWidth: 1 }}
        ></path>
      </g>
    </svg>
  );
});
DefenseToolbarIcon.displayName = 'DefenseToolbarIcon';

export const BallIcon: React.FC<{ onClick: () => void }> = React.memo(({ onClick }) => {
  const handleOnClick = (): void => {
    if (onClick) onClick();
  };

  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 16 16"
      style={{ overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient cx="0.6" cy="0.4" r="0.5" id="ballGradient">
          <stop offset="0%" stopColor="#ffcaa6"></stop>
          <stop offset="75%" stopColor="#d54800"></stop>
          <stop offset="100%" stopColor="#8d3d17"></stop>
        </radialGradient>
      </defs>
      <g transform="matrix(1,0,0,1,8,9)" className="ball" onClick={handleOnClick}>
        <g>
          <ellipse cx="0" cy="0" rx="7.25" ry="7" fill="url(#ballGradient)"></ellipse>
          <path
            d="m -3.4,-6.1 c 2.3,-0.9 5.3,2 8.5,1 M -5.6,4.5 C -4.3,0.6 5.6,-8.1 5.9,4 M -0.4,7 C 2.7,3.5 3.1,-3.5 2.1,-6.6 M -7,-1.2 C -6.6,-3.3 3.2,-6.3 7,-1"
            stroke="#000000"
            fill="none"
            style={{ strokeWidth: 0.2 }}
          ></path>
        </g>
      </g>
    </svg>
  );
});
BallIcon.displayName = 'BallIcon';

export const ConeIcon: React.FC<{ onClick: () => void }> = React.memo(({ onClick }) => {
  const handleOnClick = (): void => {
    if (onClick) onClick();
  };

  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{ overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient x1="0" y1="0.5" x2="1" y2="0.5" id="coneGradient">
          <stop offset="0%" stopColor="#ffffff"></stop>
          <stop offset="25%" stopColor="#ff7f7f"></stop>
          <stop offset="100%" stopColor="#f00000"></stop>
        </linearGradient>
      </defs>
      <g transform="matrix(1,0,0,1,15,16)" className="cone" onClick={handleOnClick}>
        <g>
          <path d="m -5,8 4.5,-17 1,0 4.5,17 z" fill="url(#coneGradient)"></path>
          <line x1="-10" x2="10" y1="8" y2="8" stroke="#000000" style={{ strokeWidth: 1 }}></line>
          <line x1="-10" x2="10" y1="9" y2="9" stroke="#f00000" style={{ strokeWidth: 1 }}></line>
        </g>
      </g>
    </svg>
  );
});
ConeIcon.displayName = 'ConeIcon';

export const CoachIcon: React.FC = React.memo(() => {
  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{ overflow: 'hidden', userSelect: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="matrix(1,0,0,1,15,16)" className="coach">
        <g>
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="#ffffff"
            stroke="#de4814"
            style={{ strokeWidth: 2 }}
          ></circle>
          <text
            x="-5.5"
            y="4.5"
            fill="#de4814"
            style={{
              fontSize: '18px',
              fontFamily: 'Arial',
              fontWeight: 'bold',
              pointerEvents: 'none',
            }}
          >
            c
          </text>
        </g>
      </g>
    </svg>
  );
});
CoachIcon.displayName = 'CoachIcon';

export const TextIcon: React.FC = React.memo(() => {
  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{ overflow: 'hidden', userSelect: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <desc>Text Icon</desc>
      <defs></defs>
      <g transform="translate(0,2)" className="text">
        <text
          x="15"
          y="25"
          fill="#000000"
          style={{
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            textAnchor: 'middle',
          }}
        >
          T
        </text>
      </g>
    </svg>
  );
});
TextIcon.displayName = 'TextIcon';

type ChangeColorIconProps = {
  currentColor?: string;
  onColorChange?: (newColor: string) => void;
};

export const AreaIcon: React.FC<ChangeColorIconProps> = React.memo(
  ({ currentColor = '#003366', onColorChange }) => {
    const [currentColorIndex, setCurrentColorIndex] = useState(0);

    useEffect(() => {
      const index = DefaultColors.indexOf(currentColor);
      if (index !== -1) {
        setCurrentColorIndex(index);
      }
    }, [currentColor]);

    const handleMoveLeft = (): void => {
      const newIndex = (currentColorIndex - 1 + DefaultColors.length) % DefaultColors.length;
      setCurrentColorIndex(newIndex);
      if (onColorChange) onColorChange(DefaultColors[newIndex]);
    };

    const handleMoveRight = (): void => {
      const newIndex = (currentColorIndex + 1) % DefaultColors.length;
      setCurrentColorIndex(newIndex);
      if (onColorChange) onColorChange(DefaultColors[newIndex]);
    };

    return (
      <svg
        version="1.1"
        width="34"
        height="42"
        viewBox="-2 0 32 42"
        style={{ overflow: 'hidden' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          fill={DefaultColors[currentColorIndex]}
          style={{ opacity: 0.6, strokeWidth: 1 }}
          className="area"
          transform="matrix(1,0,0,1,1,3)"
          stroke="#333333"
        >
          <ellipse cx="13" cy="13" rx="13" ry="13"></ellipse>
        </g>
        <g onClick={handleMoveLeft} style={{ cursor: 'pointer' }}>
          <rect
            x="-3"
            y="31"
            width="17"
            height="11"
            fill="rgba(0,0,0,0)"
            stroke="#dfdfdf"
            strokeWidth={1}
          ></rect>
          <path
            d="m 8,34 -4,2 4,2"
            fill="rgba(0,0,0,0)"
            stroke="#000000"
            style={{ strokeWidth: 1 }}
          ></path>
        </g>
        <g onClick={handleMoveRight} style={{ cursor: 'pointer' }}>
          <rect
            x="14"
            y="31"
            width="17"
            height="11"
            fill="rgba(0,0,0,0)"
            stroke="#dfdfdf"
            strokeWidth={1}
          ></rect>
          <path
            d="m 21,34 4,2 -4,2"
            fill="rgba(0,0,0,0)"
            stroke="#000000"
            style={{ strokeWidth: 1 }}
          ></path>
        </g>
      </svg>
    );
  }
);
AreaIcon.displayName = 'AreaIcon';

export const ChangeColorIcon: React.FC<ChangeColorIconProps> = React.memo(
  ({ currentColor = '#003366', onColorChange }) => {
    const [showOverlay, setShowOverlay] = useState(false);

    const handleColorSelect = (color: string): void => {
      setShowOverlay(false);
      if (onColorChange) onColorChange(color);
    };

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg
          version="1.1"
          width="30"
          height="30"
          viewBox="0 -2 32 34"
          style={{ overflow: 'hidden', cursor: 'pointer' }}
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => setShowOverlay(!showOverlay)}
        >
          <path
            d="M 16,1 C 7.7,1 1,7.7 1,16 c 0,8.3 6.7,15 15,15 1.4,0 2.5,-1.1 2.5,-2.5 0,-0.65 -0.1,-1.05 -0.5,-1.5 -0.4,-0.4 -1,-1.4 -1,-2 0,-1.4 1.6,-2 3,-2 l 3,0 c 4.6,0 8,-4.4 8,-9 C 31,6.6 24.3,1 16,1 Z M 7,16 C 5.6,16 4.5,14.9 4.5,13.5 4.5,12.1 5.6,11 7,11 8.4,11 9.5,12.1 9.5,13.5 9.5,14.9 8.4,16 7,16 Z M 12,9.5 C 10.6,9.5 9.5,8.4 9.5,7 9.5,5.6 10.6,4.5 12,4.5 c 1.4,0 2.5,1.1 2.5,2.5 0,1.4 -1.1,2.5 -2.5,2.5 z m 8,0 c -1.4,0 -2.5,-1.1 -2.5,-2.5 0,-1.4 1.1,-2.5 2.5,-2.5 1.4,0 2.5,1.1 2.5,2.5 0,1.4 -1.1,2.5 -2.5,2.5 z m 5,6.5 c -1.4,0 -2.5,-1.1 -2.5,-2.5 0,-1.4 1.1,-2.5 2.5,-2.5 1.4,0 2.5,1.1 2.5,2.5 0,1.4 -1.1,2.5 -2.5,2.5 z"
            stroke="none"
            fill={currentColor}
          ></path>
        </svg>

        {showOverlay && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            {DefaultColors.map((color) => (
              <svg
                key={color}
                width="26"
                height="26"
                viewBox="0 0 26 26"
                xmlns="http://www.w3.org/2000/svg"
                style={{ cursor: 'pointer' }}
                onClick={() => handleColorSelect(color)}
              >
                <ellipse cx="13" cy="13" rx="13" ry="13" fill={color} />
              </svg>
            ))}
          </div>
        )}
      </div>
    );
  }
);
ChangeColorIcon.displayName = 'ChangeColorIcon';

export const LineMovementIcon: React.FC = React.memo(() => {
  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{ overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="5" x2="25" y1="17" y2="17" stroke="#000000" style={{ strokeWidth: 2 }}></line>
      <path d="m 26,17 -5,-5 0,10 z" fill="#000000" style={{ strokeWidth: 0 }}></path>
    </svg>
  );
});
LineMovementIcon.displayName = 'LineMovementIcon';

export const LinePassingIcon: React.FC = React.memo(() => {
  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{ overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="5"
        x2="25"
        y1="17"
        y2="17"
        stroke="#000000"
        style={{
          strokeWidth: 2,
          strokeDasharray: '3, 3',
        }}
      ></line>
      <path d="m 26,17 -5,-5 0,10 z" fill="#000000" style={{ strokeWidth: 0 }}></path>
    </svg>
  );
});
LinePassingIcon.displayName = 'LinePassingIcon';

export const LineDribblingIcon: React.FC = React.memo(() => {
  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{ overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m 3,16.5 1,0 c 2,0 2,2 4,2 2,0 2,-2 4,-2 2,0 2,2 4,2 2,0 2,-2 4,-2 l 1,0"
        fill="none"
        stroke="#000000"
        style={{ strokeWidth: 2 }}
      ></path>
      <path d="m 26,17 -5,-5 0,10 z" fill="#000000" style={{ strokeWidth: 0 }}></path>
    </svg>
  );
});
LineDribblingIcon.displayName = 'LineDribblingIcon';

export const LineScreenIcon: React.FC = React.memo(() => {
  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{ overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <desc>Created with Snap</desc>
      <defs></defs>
      <line x1="5" x2="25" y1="17" y2="17" stroke="#000000" style={{ strokeWidth: 2 }}></line>
      <line x1="25" x2="25" y1="12" y2="22" stroke="#000000" style={{ strokeWidth: 2 }}></line>
    </svg>
  );
});
LineScreenIcon.displayName = 'LineScreenIcon';

export const ShootingIcon: React.FC = React.memo(() => {
  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 34 34"
      style={{ overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="matrix(1,0,0,1,-8,20)" stroke="#000000" className="shoot" style={{}}>
        <path
          d="m -9,-25 8,-14 8,14 -4,0 0,13 -7.5,0 0,-13 z"
          fill="#ffffff"
          transform="matrix(0,1,-1,0,0,0)"
          style={{ strokeWidth: 1 }}
        ></path>
      </g>
    </svg>
  );
});
ShootingIcon.displayName = 'ShootingIcon';

export const LineIcon: React.FC = React.memo(() => {
  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{ overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="5" x2="25" y1="17" y2="17" stroke="#000000" style={{ strokeWidth: 2 }}></line>
    </svg>
  );
});
LineIcon.displayName = 'LineIcon';

export const HandoffIcon: React.FC = React.memo(() => {
  return (
    <svg
      version="1.1"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{ overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="matrix(1,0,0,1,15,16)" stroke="#000000" className="handoff" style={{}}>
        <path d="M -8,0 H 8 M 4,-8 V 8 M -4,-8 V 8" fill="none" style={{ strokeWidth: 2 }}></path>
      </g>
    </svg>
  );
});
HandoffIcon.displayName = 'HandoffIcon';

export const ToggleHalfCourtIcon: React.FC<{
  isFullCourt: boolean;
  onChange: (newState: boolean) => void;
}> = React.memo(({ isFullCourt = true, onChange }) => {
  const height = isFullCourt ? 50 : 25;
  const topCircleY = isFullCourt ? 12.5 : 12;
  const bottomCircleY = isFullCourt ? 37.5 : 38;

  const handleClick = (): void => {
    const newState = !isFullCourt;
    if (onChange) onChange(newState);
  };

  return (
    <svg
      version="1.1"
      width="30"
      height="50"
      viewBox="0 0 30 50"
      style={{
        overflow: 'hidden',
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer',
      }}
      xmlns="http://www.w3.org/2000/svg"
      onClick={handleClick}
    >
      <defs>
        <linearGradient id="topGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#007ac1" />
          <stop offset="100%" stopColor="#0089cf" />
        </linearGradient>
        <linearGradient id="bottomGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dcdcdc" />
          <stop offset="100%" stopColor="#cccccc" />
        </linearGradient>
      </defs>

      {/* Top half or full court */}
      <rect x="0" y="0" width="30" height={height} fill="url(#topGradient)" />

      {/* Bottom half only for half court */}
      {!isFullCourt && <rect x="0" y="25" width="30" height="25" fill="url(#bottomGradient)" />}

      <g fill="none" stroke="#ffffff" style={{ strokeWidth: 2, strokeLinecap: 'round' }}>
        {/* Horizontal line at the middle for full court */}
        {isFullCourt && <line x1="0" x2="30" y1="25" y2="25" />}
        {/* Top and bottom circles */}
        <circle cx="15" cy={topCircleY} r="4" />
        <circle cx="15" cy={bottomCircleY} r="4" />
        {/* Top basket lines */}
        <line x1="4" x2="26" y1="4" y2="4" />
        <line x1="15" x2="15" y1="4" y2="8.5" />
        {/* Bottom basket lines */}
        <line x1="4" x2="26" y1="46" y2="46" />
        <line x1="15" x2="15" y1="41.5" y2="46" />
      </g>
    </svg>
  );
});
ToggleHalfCourtIcon.displayName = 'ToggleHalfCourtIcon';

interface FollowMouseCircleProps {
  visible: boolean;
  onClick: (x: number, y: number) => void;
}

export const FollowMouseCircle: React.FC<FollowMouseCircleProps> = ({ visible, onClick }) => {
  const { gRef, mousePosition } = useMousePosition(visible);

  const handleClick = (event: React.MouseEvent<SVGCircleElement, MouseEvent>): void => {
    event.stopPropagation(); // Prevent the event from bubbling up to parent elements
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
