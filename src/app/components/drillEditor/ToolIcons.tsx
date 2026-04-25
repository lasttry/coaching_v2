'use client';

import React from 'react';
import { DEFAULT_COACH_COLOR, DEFAULT_DEFENSE_COLOR, DEFAULT_OFFENSE_COLOR } from './constants';

const commonProps = {
  width: 26,
  height: 26,
  style: { display: 'block' },
} as const;

export function SelectIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 30 30">
      <path
        d="m 11,10 0,11.5 c 0.6,-1 1.2,-2 2,-2.5 l 2,5.5 2,-0.5 -2,-5.5 c 1,0 2.5,0 4,0.5 z"
        fill="#000"
      />
    </svg>
  );
}

export function EraserIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 30 30">
      <text
        x="15"
        y="23"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#000"
      >
        ×
      </text>
    </svg>
  );
}

export function OffenseIcon({ number }: { number?: number } = {}): React.ReactElement {
  const c = DEFAULT_OFFENSE_COLOR;
  const n = number ?? 1;
  return (
    <svg {...commonProps} viewBox="-15 -15 30 30">
      <circle cx="0" cy="0" r="10" fill="#ffffff" stroke={c} strokeWidth="2" />
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Arial"
        fontSize={n > 9 ? 11 : 14}
        fontWeight="700"
        fill={c}
      >
        {n}
      </text>
    </svg>
  );
}

export function DefenseIcon({ number }: { number?: number } = {}): React.ReactElement {
  const c = DEFAULT_DEFENSE_COLOR;
  const n = number ?? 1;
  return (
    <svg {...commonProps} viewBox="-17 -17 34 30">
      <g transform="scale(0.7)" fill={c} stroke={c}>
        <path d="m -20,10 c 10,-16 30,-16 40,0 -5,-24 -35,-24 -40,0" stroke="none" />
        <circle cx="0" cy="0" r="7" fill="#ffffff" strokeWidth="2" />
      </g>
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Arial"
        fontSize={n > 9 ? 9 : 11}
        fontWeight="700"
        fill={c}
      >
        {n}
      </text>
    </svg>
  );
}

export function BallIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="-8 -8 16 16">
      <defs>
        <radialGradient cx="0.6" cy="0.4" r="0.5" id="btn-ball-gradient">
          <stop offset="0%" stopColor="#ffcaa6" />
          <stop offset="75%" stopColor="#d54800" />
          <stop offset="100%" stopColor="#8d3d17" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="0" rx="7.25" ry="7" fill="url(#btn-ball-gradient)" />
      <path
        d="m -3.4,-6.1 c 2.3,-0.9 5.3,2 8.5,1 M -5.6,4.5 C -4.3,0.6 5.6,-8.1 5.9,4 M -0.4,7 C 2.7,3.5 3.1,-3.5 2.1,-6.6 M -7,-1.2 C -6.6,-3.3 3.2,-6.3 7,-1"
        stroke="#000"
        fill="none"
        strokeWidth="0.35"
      />
    </svg>
  );
}

export function ConeIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="-12 -10 24 20">
      <defs>
        <linearGradient x1="0" y1="0.5" x2="1" y2="0.5" id="btn-cone-gradient">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#ff7f7f" />
          <stop offset="100%" stopColor="#f00000" />
        </linearGradient>
      </defs>
      <path d="m -5,8 4.5,-17 1,0 4.5,17 z" fill="url(#btn-cone-gradient)" />
      <line x1="-10" x2="10" y1="8" y2="8" stroke="#000" strokeWidth="1" />
      <line x1="-10" x2="10" y1="9" y2="9" stroke="#f00000" strokeWidth="1" />
    </svg>
  );
}

export function CoachIcon(): React.ReactElement {
  const c = DEFAULT_COACH_COLOR;
  return (
    <svg {...commonProps} viewBox="-15 -15 30 30">
      <circle cx="0" cy="0" r="10" fill="#ffffff" stroke={c} strokeWidth="2" />
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Arial"
        fontSize="18"
        fontWeight="700"
        fill={c}
      >
        c
      </text>
    </svg>
  );
}

export function TextIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 30 30">
      <text
        x="15"
        y="23"
        textAnchor="middle"
        fontFamily="'Times New Roman', Times, serif"
        fontSize="22"
        fontWeight="700"
        fill="#000"
      >
        T
      </text>
    </svg>
  );
}

export function LineMovementIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 30 30">
      <line x1="5" y1="15" x2="23" y2="15" stroke="#000" strokeWidth="2" />
      <path d="m 26,15 -5,-5 0,10 z" fill="#000" />
    </svg>
  );
}

export function LinePassingIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 30 30">
      <line x1="5" y1="15" x2="23" y2="15" stroke="#000" strokeWidth="2" strokeDasharray="3 3" />
      <path d="m 26,15 -5,-5 0,10 z" fill="#000" />
    </svg>
  );
}

export function LineDribblingIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 30 30">
      <path
        d="m 3,15 1,0 c 2,0 2,2 4,2 2,0 2,-2 4,-2 2,0 2,2 4,2 2,0 2,-2 4,-2 l 1,0"
        fill="none"
        stroke="#000"
        strokeWidth="2"
      />
      <path d="m 26,15 -5,-5 0,10 z" fill="#000" />
    </svg>
  );
}

export function LineScreenIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 30 30">
      <line x1="5" y1="15" x2="25" y2="15" stroke="#000" strokeWidth="2" />
      <line x1="25" y1="10" x2="25" y2="20" stroke="#000" strokeWidth="2" />
    </svg>
  );
}

export function LinePlainIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 30 30">
      <line x1="5" y1="15" x2="25" y2="15" stroke="#000" strokeWidth="2" />
    </svg>
  );
}

export function LineStopIcon(): React.ReactElement {
  // "cut & stop" — straight line with perpendicular bar at end
  return (
    <svg {...commonProps} viewBox="0 0 30 30">
      <line x1="5" y1="15" x2="24" y2="15" stroke="#000" strokeWidth="2" />
      <line x1="23" y1="9" x2="23" y2="21" stroke="#000" strokeWidth="3" />
    </svg>
  );
}

export function ShootingIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 34 34">
      <g transform="translate(-8, 20)" stroke="#000" fill="#fff">
        <path
          d="m -9,-25 8,-14 8,14 -4,0 0,13 -7.5,0 0,-13 z"
          transform="matrix(0,1,-1,0,0,0)"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

export function HandoffIcon(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 30 30">
      <g transform="translate(15, 15)" stroke="#000" strokeWidth="2" fill="none">
        <path d="M -8,0 H 8 M 4,-8 V 8 M -4,-8 V 8" />
      </g>
    </svg>
  );
}

export function AreaIcon({
  variant,
}: {
  variant: 'circle' | 'square' | 'triangle';
}): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="-15 -15 30 30">
      {variant === 'circle' && (
        <circle
          cx="0"
          cy="0"
          r="10"
          fill="#ffff00"
          stroke="#333"
          strokeOpacity="0.9"
          opacity="0.6"
        />
      )}
      {variant === 'square' && (
        <rect x="-10" y="-10" width="20" height="20" fill="#ffff00" stroke="#333" opacity="0.6" />
      )}
      {variant === 'triangle' && (
        <path d="M 0 -10 L 8.66 5 L -8.66 5 Z" fill="#ffff00" stroke="#333" opacity="0.6" />
      )}
    </svg>
  );
}

export function ChevronLeftIconSvg(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path
        d="M 8 2 L 3 6 L 8 10"
        fill="none"
        stroke="#000"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIconSvg(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path
        d="M 4 2 L 9 6 L 4 10"
        fill="none"
        stroke="#000"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UndoIconSvg(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 32 32">
      <path
        d="M 9.32,12 6,8 2,22 16,20 13,16.4 C 19.807988,10.567528 27.269307,15.992795 30,22 28.362626,10.321451 18.060691,5.8007801 9.32,12 Z"
        fill="#000"
      />
    </svg>
  );
}

export function HalfCourtIcon(): React.ReactElement {
  return (
    <svg width="22" height="36" viewBox="0 0 30 50" style={{ display: 'block' }}>
      <rect x="0" y="0" width="30" height="25" fill="#0089cf" />
      <rect x="0" y="25" width="30" height="25" fill="#cccccc" />
      <g fill="none" stroke="#ffffff" strokeWidth="2">
        <line x1="4" x2="26" y1="4" y2="4" />
        <line x1="15" x2="15" y1="4" y2="8.5" />
        <circle cx="15" cy="12" r="4" />
        <line x1="4" x2="26" y1="46" y2="46" />
        <line x1="15" x2="15" y1="41.5" y2="46" />
        <circle cx="15" cy="38" r="4" />
      </g>
    </svg>
  );
}

export function MenuIconSvg(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 0 32 32">
      <path d="M 2,26 H 30 V 22 H 2 Z M 2,14 v 4 H 30 V 14 Z M 2,6 v 4 H 30 V 6 Z" fill="#000" />
    </svg>
  );
}

export function DownloadIconSvg(): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 -2 30 32">
      <path
        d="M 30,26.6406 30,3.2813 Q 30,1.9531 28.98437,1.0156 28.04687,0 26.64062,0 L 3.35937,0 Q 1.95312,0 0.9375,1.0156 0,1.9531 0,3.2813 L 0,26.6406 Q 0,28.0469 0.9375,29.0625 1.95312,30 3.35937,30 l 23.28125,0 q 1.40625,0 2.34375,-0.9375 Q 30,28.0469 30,26.6406 l 0,0 z M 9.14062,17.5 l 4.21875,5 5.78125,-7.5 7.5,10 -23.28125,0 5.78125,-7.5 0,0 z"
        fill="#000"
      />
    </svg>
  );
}

export function PaletteIconSvg({ fill = '#009fe3' }: { fill?: string }): React.ReactElement {
  return (
    <svg {...commonProps} viewBox="0 -2 32 34">
      <path
        d="M 16,1 C 7.7,1 1,7.7 1,16 c 0,8.3 6.7,15 15,15 1.4,0 2.5,-1.1 2.5,-2.5 0,-0.65 -0.1,-1.05 -0.5,-1.5 -0.4,-0.4 -1,-1.4 -1,-2 0,-1.4 1.6,-2 3,-2 l 3,0 c 4.6,0 8,-4.4 8,-9 C 31,6.6 24.3,1 16,1 Z M 7,16 C 5.6,16 4.5,14.9 4.5,13.5 4.5,12.1 5.6,11 7,11 8.4,11 9.5,12.1 9.5,13.5 9.5,14.9 8.4,16 7,16 Z M 12,9.5 C 10.6,9.5 9.5,8.4 9.5,7 9.5,5.6 10.6,4.5 12,4.5 c 1.4,0 2.5,1.1 2.5,2.5 0,1.4 -1.1,2.5 -2.5,2.5 z m 8,0 c -1.4,0 -2.5,-1.1 -2.5,-2.5 0,-1.4 1.1,-2.5 2.5,-2.5 1.4,0 2.5,1.1 2.5,2.5 0,1.4 -1.1,2.5 -2.5,2.5 z m 5,6.5 c -1.4,0 -2.5,-1.1 -2.5,-2.5 0,-1.4 1.1,-2.5 2.5,-2.5 1.4,0 2.5,1.1 2.5,2.5 0,1.4 -1.1,2.5 -2.5,2.5 z"
        fill={fill}
      />
    </svg>
  );
}
