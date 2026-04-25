'use client';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export const COURT_W = 1500;
export const HALF_H = 1400;
export const FULL_H = 2800;

export const COURT_STROKE = '#ffffff';
export const COURT_OUT = '#9aa4ad';

/** Basket centre positions (1 unit = 1 cm, same as court grid). */
export const BASKET_Y_TOP = 157.5;
export const BASKET_Y_BOTTOM = FULL_H - 157.5;
export const BASKET_X = COURT_W / 2;

/** Returns the basket that should receive a shot placed at (x, y).
 * - On half court the only basket is the top one.
 * - On full court, the basket on the same half of the court as the shot. */
export function basketForShot(x: number, y: number, fullCourt: boolean): { x: number; y: number } {
  if (!fullCourt) return { x: BASKET_X, y: BASKET_Y_TOP };
  return y < HALF_H ? { x: BASKET_X, y: BASKET_Y_TOP } : { x: BASKET_X, y: BASKET_Y_BOTTOM };
}

export interface CourtTheme {
  /** Solid flat color for the playing surface (replaces wood pattern) */
  background?: string | null;
  /** Fill color for the restricted area (key) */
  keyFill?: string | null;
  /** Fill color inside the centre circle */
  centerFill?: string | null;
  /** Color of the court line markings */
  lineColor?: string | null;
  /** Color of the out-of-bounds margin (BLOB/SLOB area) */
  marginColor?: string | null;
  /** Optional URL of an image rendered inside the centre circle (e.g. club logo). */
  centerLogoUrl?: string | null;
  /** Rotation in degrees applied to the centre logo. Defaults to 90 so the
   * crest reads correctly from the sidelines, the way it is painted on a
   * real FIBA court. */
  centerLogoRotation?: number | null;
}

interface CourtProps {
  full?: boolean;
  theme?: CourtTheme;
}

/** Predefined pattern identifiers the user can select as court backgrounds. */
export const COURT_PATTERNS = ['wood', 'parquet', 'concrete', 'clay'] as const;
export type CourtPattern = (typeof COURT_PATTERNS)[number];

export function isCourtPattern(value: string | null | undefined): value is CourtPattern {
  return !!value && (COURT_PATTERNS as readonly string[]).includes(value);
}

function WoodPattern(): React.ReactElement {
  /* Improved court patterns. Each tile is generated with multiple layers
   * (base colour, plank seams, knots, grain) so the floor reads as a real
   * surface even at editor zoom levels. Patterns are deliberately tall
   * (planks are long) and seamless on both axes. */
  return (
    <defs>
      {/* WOOD — long honey-coloured planks running along the long axis. */}
      <linearGradient id="wood-plank" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d8a366" />
        <stop offset="40%" stopColor="#c98951" />
        <stop offset="70%" stopColor="#d29159" />
        <stop offset="100%" stopColor="#b9763d" />
      </linearGradient>
      <linearGradient id="wood-plank-2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#cf9858" />
        <stop offset="35%" stopColor="#dba264" />
        <stop offset="80%" stopColor="#c08144" />
        <stop offset="100%" stopColor="#a96b30" />
      </linearGradient>
      <pattern id="wood-tile" width="180" height="640" patternUnits="userSpaceOnUse">
        {/* Two adjacent planks (different grains so it doesn't look striped). */}
        <rect x="0" y="0" width="90" height="640" fill="url(#wood-plank)" />
        <rect x="90" y="0" width="90" height="640" fill="url(#wood-plank-2)" />
        {/* Plank seams (vertical) */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="640"
          stroke="#3a230f"
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />
        <line
          x1="90"
          y1="0"
          x2="90"
          y2="640"
          stroke="#3a230f"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />
        <line
          x1="180"
          y1="0"
          x2="180"
          y2="640"
          stroke="#3a230f"
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />
        {/* Cross-seams between board lengths (staggered). */}
        <line
          x1="0"
          y1="0"
          x2="90"
          y2="0"
          stroke="#3a230f"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <line
          x1="90"
          y1="320"
          x2="180"
          y2="320"
          stroke="#3a230f"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <line
          x1="0"
          y1="500"
          x2="90"
          y2="500"
          stroke="#3a230f"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        {/* Grain — subtle wavy lines */}
        <g stroke="#7a4a1f" strokeOpacity="0.18" strokeWidth="0.6" fill="none">
          <path d="M 4 30 Q 30 26 50 32 Q 70 38 86 30" />
          <path d="M 4 90 Q 30 96 50 88 Q 70 80 86 92" />
          <path d="M 4 160 Q 40 154 60 162 Q 76 168 86 160" />
          <path d="M 4 240 Q 30 246 50 240 Q 70 234 86 246" />
          <path d="M 4 320 Q 30 326 60 318 Q 76 312 86 322" />
          <path d="M 4 410 Q 30 414 50 408 Q 70 402 86 414" />
          <path d="M 4 490 Q 30 484 50 492 Q 70 500 86 488" />
          <path d="M 4 570 Q 40 564 60 572 Q 76 580 86 572" />
          <path d="M 94 60 Q 120 66 140 58 Q 160 50 176 62" />
          <path d="M 94 130 Q 120 124 140 132 Q 160 140 176 130" />
          <path d="M 94 210 Q 130 204 150 212 Q 166 218 176 210" />
          <path d="M 94 290 Q 120 284 140 292 Q 160 300 176 290" />
          <path d="M 94 380 Q 120 386 140 378 Q 160 370 176 384" />
          <path d="M 94 460 Q 120 454 140 462 Q 160 470 176 458" />
          <path d="M 94 540 Q 130 534 150 542 Q 166 548 176 540" />
        </g>
        {/* Occasional knots */}
        <ellipse cx="34" cy="120" rx="4" ry="2.5" fill="#5d3818" opacity="0.45" />
        <ellipse cx="68" cy="380" rx="3.5" ry="2" fill="#5d3818" opacity="0.4" />
        <ellipse cx="124" cy="220" rx="3" ry="2" fill="#5d3818" opacity="0.4" />
        <ellipse cx="148" cy="500" rx="4" ry="2.5" fill="#5d3818" opacity="0.45" />
      </pattern>

      {/* PARQUET — herringbone, FIBA-style classic. */}
      <linearGradient id="parquet-light" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#d8a36a" />
        <stop offset="100%" stopColor="#b8853f" />
      </linearGradient>
      <linearGradient id="parquet-dark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b6803f" />
        <stop offset="100%" stopColor="#8e5b22" />
      </linearGradient>
      <pattern id="parquet-block" width="160" height="160" patternUnits="userSpaceOnUse">
        {/* Two perpendicular planks forming an L; tiled they create herringbone. */}
        <rect x="0" y="0" width="160" height="80" fill="url(#parquet-light)" />
        <rect x="0" y="80" width="160" height="80" fill="url(#parquet-dark)" />
        {/* Horizontal grain on the upper plank */}
        <g stroke="#7a4a1f" strokeOpacity="0.25" strokeWidth="0.6" fill="none">
          <line x1="0" y1="14" x2="160" y2="14" />
          <line x1="0" y1="34" x2="160" y2="34" />
          <line x1="0" y1="54" x2="160" y2="54" />
          <line x1="0" y1="70" x2="160" y2="70" />
        </g>
        {/* Vertical grain on the lower plank */}
        <g stroke="#5a3818" strokeOpacity="0.25" strokeWidth="0.6" fill="none">
          <line x1="20" y1="80" x2="20" y2="160" />
          <line x1="50" y1="80" x2="50" y2="160" />
          <line x1="80" y1="80" x2="80" y2="160" />
          <line x1="110" y1="80" x2="110" y2="160" />
          <line x1="140" y1="80" x2="140" y2="160" />
        </g>
        {/* Block edges */}
        <rect
          x="0"
          y="0"
          width="160"
          height="80"
          fill="none"
          stroke="#3a230f"
          strokeOpacity="0.65"
          strokeWidth="1.4"
        />
        <rect
          x="0"
          y="80"
          width="160"
          height="80"
          fill="none"
          stroke="#3a230f"
          strokeOpacity="0.65"
          strokeWidth="1.4"
        />
      </pattern>

      {/* CONCRETE — urban court grey with grain and aggregate. */}
      <pattern id="concrete-tile" width="220" height="220" patternUnits="userSpaceOnUse">
        <rect width="220" height="220" fill="#a8b1b9" />
        <rect width="220" height="220" fill="url(#concrete-noise)" opacity="0.55" />
        {/* Aggregate stones */}
        <g>
          <circle cx="22" cy="18" r="2.6" fill="#5b6770" opacity="0.55" />
          <circle cx="64" cy="40" r="1.6" fill="#7c8690" opacity="0.55" />
          <circle cx="120" cy="22" r="2.2" fill="#4f5b65" opacity="0.55" />
          <circle cx="172" cy="46" r="1.4" fill="#5b6770" opacity="0.55" />
          <circle cx="200" cy="14" r="2.1" fill="#7c8690" opacity="0.55" />
          <circle cx="34" cy="92" r="1.8" fill="#4f5b65" opacity="0.55" />
          <circle cx="86" cy="120" r="2.6" fill="#5b6770" opacity="0.55" />
          <circle cx="140" cy="100" r="1.6" fill="#7c8690" opacity="0.55" />
          <circle cx="190" cy="118" r="2.2" fill="#4f5b65" opacity="0.55" />
          <circle cx="14" cy="160" r="2" fill="#7c8690" opacity="0.5" />
          <circle cx="60" cy="186" r="1.8" fill="#5b6770" opacity="0.55" />
          <circle cx="118" cy="172" r="2.5" fill="#4f5b65" opacity="0.55" />
          <circle cx="170" cy="200" r="1.6" fill="#7c8690" opacity="0.55" />
          <circle cx="206" cy="184" r="2.2" fill="#5b6770" opacity="0.55" />
        </g>
        {/* Faint expansion joints */}
        <line x1="0" y1="0" x2="220" y2="0" stroke="#4d575f" strokeOpacity="0.4" strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="220" stroke="#4d575f" strokeOpacity="0.4" strokeWidth="1" />
      </pattern>
      {/* Concrete noise (turbulence-free fallback): tiny dots overlay */}
      <pattern id="concrete-noise" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="none" />
        <g fill="#000" fillOpacity="0.06">
          <rect x="3" y="5" width="0.8" height="0.8" />
          <rect x="11" y="2" width="0.6" height="0.6" />
          <rect x="18" y="9" width="0.8" height="0.8" />
          <rect x="26" y="4" width="0.6" height="0.6" />
          <rect x="34" y="11" width="0.8" height="0.8" />
          <rect x="6" y="17" width="0.6" height="0.6" />
          <rect x="14" y="22" width="0.8" height="0.8" />
          <rect x="22" y="18" width="0.6" height="0.6" />
          <rect x="30" y="24" width="0.8" height="0.8" />
          <rect x="38" y="20" width="0.6" height="0.6" />
          <rect x="2" y="29" width="0.8" height="0.8" />
          <rect x="10" y="34" width="0.6" height="0.6" />
          <rect x="20" y="32" width="0.8" height="0.8" />
          <rect x="28" y="36" width="0.6" height="0.6" />
          <rect x="36" y="30" width="0.8" height="0.8" />
        </g>
        <g fill="#fff" fillOpacity="0.05">
          <rect x="7" y="11" width="0.6" height="0.6" />
          <rect x="15" y="6" width="0.8" height="0.8" />
          <rect x="24" y="13" width="0.6" height="0.6" />
          <rect x="32" y="8" width="0.8" height="0.8" />
          <rect x="4" y="22" width="0.6" height="0.6" />
          <rect x="12" y="27" width="0.8" height="0.8" />
          <rect x="20" y="25" width="0.6" height="0.6" />
          <rect x="29" y="29" width="0.8" height="0.8" />
          <rect x="36" y="34" width="0.6" height="0.6" />
          <rect x="6" y="38" width="0.8" height="0.8" />
        </g>
      </pattern>

      {/* CLAY — red dust with subtle grain bands. */}
      <pattern id="clay-tile" width="220" height="220" patternUnits="userSpaceOnUse">
        <rect width="220" height="220" fill="#c44a2c" />
        <rect width="220" height="220" fill="url(#clay-bands)" opacity="0.5" />
        <g fill="#7e2912" opacity="0.4">
          <circle cx="14" cy="22" r="1.6" />
          <circle cx="40" cy="48" r="1.3" />
          <circle cx="78" cy="20" r="1.8" />
          <circle cx="120" cy="38" r="1.5" />
          <circle cx="160" cy="14" r="1.7" />
          <circle cx="200" cy="48" r="1.4" />
          <circle cx="20" cy="84" r="1.7" />
          <circle cx="64" cy="106" r="1.5" />
          <circle cx="110" cy="92" r="1.4" />
          <circle cx="156" cy="110" r="1.8" />
          <circle cx="194" cy="90" r="1.4" />
          <circle cx="32" cy="158" r="1.6" />
          <circle cx="76" cy="178" r="1.4" />
          <circle cx="124" cy="160" r="1.7" />
          <circle cx="170" cy="184" r="1.5" />
          <circle cx="206" cy="170" r="1.6" />
        </g>
        <g fill="#f08664" opacity="0.35">
          <circle cx="28" cy="56" r="1" />
          <circle cx="92" cy="34" r="1.2" />
          <circle cx="148" cy="68" r="1" />
          <circle cx="58" cy="142" r="1.1" />
          <circle cx="184" cy="148" r="1.2" />
        </g>
      </pattern>
      <pattern id="clay-bands" width="220" height="40" patternUnits="userSpaceOnUse">
        <rect width="220" height="40" fill="#b8401f" opacity="0.25" />
        <rect y="20" width="220" height="20" fill="#9d3717" opacity="0.25" />
      </pattern>

      {/* Subtle ambient shading overlay used on top of any pattern. */}
      <linearGradient id="wood-shade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.05" />
        <stop offset="0.5" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.1" />
      </linearGradient>
    </defs>
  );
}

function patternUrlFor(pattern: CourtPattern): string {
  switch (pattern) {
    case 'wood':
      return 'url(#wood-tile)';
    case 'parquet':
      return 'url(#parquet-block)';
    case 'concrete':
      return 'url(#concrete-tile)';
    case 'clay':
      return 'url(#clay-tile)';
  }
}

function HalfCourtLines({
  yOffset = 0,
  flip = false,
  lineColor = COURT_STROKE,
}: {
  yOffset?: number;
  flip?: boolean;
  lineColor?: string;
}) {
  /* All measurements taken from FIBA Official Basketball Rules 2018 (Art. 2).
   * Coordinate system: 1 unit = 1 cm. Top endline at y=0.
   * Court: 28 m × 15 m (2800 × 1500 cm). Half height = 1400 cm.
   * All on-court lines are 5 cm wide (Rule 2.4).
   */
  const cx = COURT_W / 2;

  // Rule 2.4.7 & Backboard position
  const backboardY = 120; // 1.20 m from endline (inner edge of backboard)
  const backboardHalfW = 90; // backboard 1.80 m total width
  const basketY = 157.5; // 1.575 m from endline to basket centre
  const basketR = 22.5; // ring: 45 cm diameter
  const noChargeR = 125; // 1.25 m no-charge semi-circle radius

  // Rule 2.4.3 restricted area (key) + free-throw line
  const keyHalfW = 245; // 2.45 m from mid-point of endline -> key 4.90 m wide
  const ftLineY = 580; // 5.80 m from endline (outer edge of free-throw line)
  const ftLineHalfW = 180; // free-throw line itself is 3.60 m long (centered)
  const ftCircleR = 180; // 1.80 m free-throw semi-circle radius

  // Rule 2.4.4 3-point line
  const threeR = 675; // 6.75 m radius from basket centre to outer edge of arc
  const threeStraightX = 90; // 0.90 m from inner edge of sidelines
  // Intersection of straight line (x=90) with arc of radius 675 centered at (750, 157.5)
  // sqrt(675^2 - (750-90)^2) = sqrt(455625 - 435600) = sqrt(20025) ≈ 141.51
  const threeStraightEndY = 157.5 + Math.sqrt(threeR * threeR - (cx - threeStraightX) ** 2);

  const transform = flip ? `translate(0 ${yOffset + 1400}) scale(1 -1)` : `translate(0 ${yOffset})`;

  /* Free-throw rebound marks ("blocks") along the restricted area.
   * Rule 2.4.3 Diagram 2. Modern FIBA uses: first neutral zone at 1.75 m,
   * then 85 cm places separated by 5 cm neutral zones.
   */
  const markDefs = [
    { y: 175, len: 10, big: true }, // first "block" - larger protrusion
    { y: 260, len: 10, big: false }, // end of first rebound place
    { y: 265, len: 10, big: false }, // start of second
    { y: 350, len: 10, big: false }, // end of second
    { y: 355, len: 10, big: false }, // start of third
    { y: 440, len: 10, big: false }, // end of third
  ];

  return (
    <g
      transform={transform}
      stroke={lineColor}
      strokeWidth="5"
      fill="none"
      strokeLinecap="butt"
      strokeLinejoin="miter"
    >
      {/* Endline */}
      <line x1={0} y1={0} x2={COURT_W} y2={0} />
      {/* Sidelines */}
      <line x1={0} y1={0} x2={0} y2={1400} />
      <line x1={COURT_W} y1={0} x2={COURT_W} y2={1400} />

      {/* 3-point line: parallel straight lines + arc (6.75 m from basket centre) */}
      <line x1={threeStraightX} y1={0} x2={threeStraightX} y2={threeStraightEndY} />
      <line
        x1={COURT_W - threeStraightX}
        y1={0}
        x2={COURT_W - threeStraightX}
        y2={threeStraightEndY}
      />
      <path
        d={`M ${threeStraightX} ${threeStraightEndY}
            A ${threeR} ${threeR} 0 0 0 ${COURT_W - threeStraightX} ${threeStraightEndY}`}
      />

      {/* Restricted area (key): 4.90 m wide × 5.80 m long */}
      <rect x={cx - keyHalfW} y={0} width={keyHalfW * 2} height={ftLineY} />

      {/* Free-throw line: 3.60 m long, drawn slightly bolder to highlight */}
      <line x1={cx - ftLineHalfW} y1={ftLineY} x2={cx + ftLineHalfW} y2={ftLineY} strokeWidth="6" />

      {/* Free-throw rebound marks (both sides of the key) */}
      {markDefs.map((m, i) => (
        <g key={i}>
          <line
            x1={cx - keyHalfW}
            y1={m.y}
            x2={cx - keyHalfW - m.len}
            y2={m.y}
            strokeWidth={m.big ? 6 : 5}
          />
          <line
            x1={cx + keyHalfW}
            y1={m.y}
            x2={cx + keyHalfW + m.len}
            y2={m.y}
            strokeWidth={m.big ? 6 : 5}
          />
        </g>
      ))}

      {/* Free-throw semi-circle: 1.80 m radius centered at mid-point of free-throw line.
       * Top half is solid (outside the key), bottom half is dashed (inside the key). */}
      <path
        d={`M ${cx - ftCircleR} ${ftLineY} A ${ftCircleR} ${ftCircleR} 0 0 0 ${cx + ftCircleR} ${ftLineY}`}
      />
      <path
        d={`M ${cx - ftCircleR} ${ftLineY} A ${ftCircleR} ${ftCircleR} 0 0 1 ${cx + ftCircleR} ${ftLineY}`}
        strokeDasharray="20 14"
      />

      {/* No-charge semi-circle (1.25 m radius) + two 37.5 cm parallel lines
       * joining the arc to the backboard plane (Rule 2.4.7). */}
      <path
        d={`M ${cx - noChargeR} ${backboardY}
            L ${cx - noChargeR} ${basketY}
            A ${noChargeR} ${noChargeR} 0 0 0 ${cx + noChargeR} ${basketY}
            L ${cx + noChargeR} ${backboardY}`}
      />

      {/* Backboard: 1.80 m wide, 1.20 m from inner edge of endline */}
      <line
        x1={cx - backboardHalfW}
        y1={backboardY}
        x2={cx + backboardHalfW}
        y2={backboardY}
        strokeWidth="8"
      />

      {/* Rim support (from backboard to rim centre) */}
      <line x1={cx} y1={backboardY} x2={cx} y2={basketY - basketR} strokeWidth="4" />

      {/* Rim: 45 cm diameter, centre 1.575 m from endline */}
      <circle cx={cx} cy={basketY} r={basketR} strokeWidth="4" />
    </g>
  );
}

export function FibaCourt({ full, theme }: CourtProps): React.ReactElement {
  const height = full ? FULL_H : HALF_H;
  const background = theme?.background ?? null;
  const marginColor = theme?.marginColor ?? '#e7ecef';
  const keyFill = theme?.keyFill ?? null;
  const centerFill = theme?.centerFill ?? null;
  const lineColor = theme?.lineColor ?? COURT_STROKE;
  return (
    <g data-court="true">
      <WoodPattern />
      {/* Out-of-bounds margin (for BLOB/SLOB plays) */}
      <rect
        x={-COURT_MARGIN}
        y={-COURT_MARGIN}
        width={COURT_W + COURT_MARGIN * 2}
        height={height + COURT_MARGIN * 2}
        fill={marginColor}
      />
      {isCourtPattern(background) ? (
        <>
          <rect x={0} y={0} width={COURT_W} height={height} fill={patternUrlFor(background)} />
          <rect x={0} y={0} width={COURT_W} height={height} fill="url(#wood-shade)" />
        </>
      ) : background ? (
        <rect x={0} y={0} width={COURT_W} height={height} fill={background} />
      ) : (
        <>
          <rect x={0} y={0} width={COURT_W} height={height} fill="url(#wood-tile)" />
          <rect x={0} y={0} width={COURT_W} height={height} fill="url(#wood-shade)" />
        </>
      )}

      {/* Optional key / restricted area fill overlay (top). Drawn behind the lines. */}
      {keyFill && (
        <>
          <rect
            x={COURT_W / 2 - 245}
            y={0}
            width={490}
            height={580}
            fill={keyFill}
            opacity="0.85"
          />
          {full && (
            <rect
              x={COURT_W / 2 - 245}
              y={FULL_H - 580}
              width={490}
              height={580}
              fill={keyFill}
              opacity="0.85"
            />
          )}
        </>
      )}

      {/* Optional centre circle fill.
       * - On full court: fills the full centre circle at the midline.
       * - On half court: fills the top semi-circle that's visible. */}
      {centerFill && full && (
        <circle cx={COURT_W / 2} cy={HALF_H} r={180} fill={centerFill} opacity="0.85" />
      )}
      {centerFill && !full && (
        <path
          d={`M ${COURT_W / 2 - 180} ${HALF_H}
              A 180 180 0 0 1 ${COURT_W / 2 + 180} ${HALF_H} Z`}
          fill={centerFill}
          opacity="0.85"
        />
      )}

      {/* Optional centre-circle logo image (e.g. club crest).
       * Clipped to a circle so it never leaks outside the centre circle.
       * On full court: full circle at the midline.
       * On half court: clipped to the top semi-circle that's visible. */}
      {theme?.centerLogoUrl &&
        (() => {
          const rotation = theme.centerLogoRotation ?? 90;
          const cx = COURT_W / 2;
          const cy = HALF_H;
          const r = 170;
          const clipId = full ? 'centerCircleClip' : 'centerHalfCircleClip';
          return (
            <>
              <defs>
                <clipPath id={clipId}>
                  {full ? (
                    <circle cx={cx} cy={cy} r={r} />
                  ) : (
                    <path
                      d={`M ${cx - r} ${cy}
                          A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`}
                    />
                  )}
                </clipPath>
              </defs>
              <g clipPath={`url(#${clipId})`}>
                <image
                  href={theme.centerLogoUrl}
                  x={-r}
                  y={-r}
                  width={r * 2}
                  height={r * 2}
                  preserveAspectRatio="xMidYMid meet"
                  opacity="0.9"
                  transform={`translate(${cx} ${cy}) rotate(${rotation})`}
                />
              </g>
            </>
          );
        })()}

      {/* Court frame (outer boundary, 5 cm white lines per Rule 2.4) */}
      <rect
        x={0}
        y={0}
        width={COURT_W}
        height={height}
        fill="none"
        stroke={lineColor}
        strokeWidth="5"
      />

      {/* Top half */}
      <HalfCourtLines yOffset={0} lineColor={lineColor} />

      {!full && (
        <>
          {/* Centre line (bottom boundary of the half-court view) */}
          <line x1={0} y1={HALF_H} x2={COURT_W} y2={HALF_H} stroke={lineColor} strokeWidth="5" />
          {/* Centre half-circle reaching up into the court from the centre line */}
          <path
            d={`M ${COURT_W / 2 - 180} ${HALF_H} A 180 180 0 0 1 ${COURT_W / 2 + 180} ${HALF_H}`}
            fill="none"
            stroke={lineColor}
            strokeWidth="5"
          />
        </>
      )}

      {full && (
        <>
          {/* Centre line (Rule 2.4.2) – parallel to endlines */}
          <line x1={0} y1={HALF_H} x2={COURT_W} y2={HALF_H} stroke={lineColor} strokeWidth="5" />
          {/* Centre circle: 1.80 m radius to outer edge (Rule 2.4.2) */}
          <circle
            cx={COURT_W / 2}
            cy={HALF_H}
            r={180}
            fill="none"
            stroke={lineColor}
            strokeWidth="5"
          />
          {/* Throw-in marks (Rule 2.4.6) */}
          <line x1={0} y1={832.5} x2={15} y2={832.5} stroke={lineColor} strokeWidth="5" />
          <line
            x1={COURT_W}
            y1={832.5}
            x2={COURT_W - 15}
            y2={832.5}
            stroke={lineColor}
            strokeWidth="5"
          />
          <line
            x1={0}
            y1={FULL_H - 832.5}
            x2={15}
            y2={FULL_H - 832.5}
            stroke={lineColor}
            strokeWidth="5"
          />
          <line
            x1={COURT_W}
            y1={FULL_H - 832.5}
            x2={COURT_W - 15}
            y2={FULL_H - 832.5}
            stroke={lineColor}
            strokeWidth="5"
          />
          {/* Bottom half (mirrored) */}
          <HalfCourtLines yOffset={HALF_H} flip lineColor={lineColor} />
        </>
      )}
    </g>
  );
}

/* Outer padding (in SVG units) so players can be placed outside the sideline
 * for BLOB/SLOB plays. This margin is drawn as a neutral grey band. */
export const COURT_MARGIN = 180;

export function courtViewBox(full: boolean): string {
  const h = full ? FULL_H : HALF_H;
  return `${-COURT_MARGIN} ${-COURT_MARGIN} ${COURT_W + COURT_MARGIN * 2} ${h + COURT_MARGIN * 2}`;
}

/* Rect describing the "keep" area — elements dragged outside will be deleted. */
export function courtBounds(full: boolean): { x: number; y: number; w: number; h: number } {
  const h = full ? FULL_H : HALF_H;
  return {
    x: -COURT_MARGIN,
    y: -COURT_MARGIN,
    w: COURT_W + COURT_MARGIN * 2,
    h: h + COURT_MARGIN * 2,
  };
}

/**
 * Produce a stand-alone SVG string containing just the court at the requested
 * half/full view with the provided theme. This is used as the *default* SVG
 * of a freshly-created drill graphic so the preview immediately shows a court
 * instead of a blank placeholder, and as a fallback when a graphic has no
 * user-drawn content yet.
 */
export function renderCourtSvg({
  full = false,
  theme,
}: {
  full?: boolean;
  theme?: CourtTheme;
} = {}): string {
  const viewBox = courtViewBox(full);
  const inner = renderToStaticMarkup(<FibaCourt full={full} theme={theme} />);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}
