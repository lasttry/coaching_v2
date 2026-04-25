'use client';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FibaCourt, basketForShot, courtViewBox, type CourtTheme } from './FibaCourt';
import { GROUP_CLASS, RENDER_ORDER } from './types';
import type {
  AreaElement,
  ArrowElement,
  BallElement,
  CoachElement,
  ConeElement,
  DrillElement,
  EditorState,
  HandoffElement,
  PlayerElement,
  ShootingElement,
  TextElement,
} from './types';

const PLAYER_R = 55; // radius of offense circle in court units (cm)

export function PlayerShape({ element }: { element: PlayerElement }): React.ReactElement {
  const { x, y, number, color, team } = element;
  if (team === 'offense') {
    return (
      <g transform={`translate(${x} ${y})`} data-role="shape">
        <circle r={PLAYER_R} fill="#ffffff" stroke={color} strokeWidth="7" />
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Helvetica, Arial, sans-serif"
          fontSize="56"
          fontWeight="700"
          fill={color}
        >
          {number}
        </text>
      </g>
    );
  }
  /* FIBA-style defence: a "hat/dome" shape above a small circle with the
   * number inside. The group rotates around the player centre so the
   * asymmetric hat doubles as a facing indicator — no extra chevron is
   * drawn on the figure itself. The rotation handle only appears on the
   * selection overlay (see DrillGraphicEditor). */
  const rotation = element.rotation ?? 0;
  /* Geometry scaled up ~1.6× from the original FIBA snippet so the
   * defender reads at roughly the same visual weight as the offensive
   * circle on the court. The hat path, inner circle and number were all
   * multiplied by the same factor to keep the proportions intact. */
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`} data-role="shape">
      <path
        d="M -96 48 c 48,-77 144,-77 192,0 -24,-115 -168,-115 -192,0 Z"
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
      <circle r="35" fill="#ffffff" stroke={color} strokeWidth="8" />
      {/* Number is drawn with counter-rotation so it is always upright, even
       * when the defender is spun around. */}
      <text
        x={0}
        y={3}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="54"
        fontWeight="700"
        fill={color}
        transform={`rotate(${-rotation})`}
      >
        {number}
      </text>
    </g>
  );
}

export function BallShape({ element }: { element: BallElement }): React.ReactElement {
  const { x, y } = element;
  const r = 32;
  return (
    <g transform={`translate(${x} ${y})`} data-role="shape">
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.97} fill="url(#fiba-ball-gradient)" />
      {/* Seam lines taken from the FIBA reference (scaled ×4.4). */}
      <g stroke="#000" fill="none" strokeWidth="1">
        <path d="M -15 -27 C -5 -31 8 -22 22 -26" />
        <path d="M -25 20 C -19 3 25 -36 26 18" />
        <path d="M -2 31 C 12 16 14 -15 9 -29" />
        <path d="M -31 -5 C -29 -15 14 -28 31 -5" />
      </g>
    </g>
  );
}

export function ConeShape({ element }: { element: ConeElement }): React.ReactElement {
  const { x, y, color } = element;
  /* Narrow cone matching the FIBA reference.
   * Original (at ×6 scale): path "m -5,8 4.5,-17 1,0 4.5,17 z" with gradient.
   * Base (y=8) 10 wide, top (y=-9) 1 wide, total height 17. */
  const s = 6;
  return (
    <g transform={`translate(${x} ${y})`} data-role="shape">
      <path
        d={`M ${-5 * s} ${8 * s}
            L ${-0.5 * s} ${-9 * s}
            L ${0.5 * s} ${-9 * s}
            L ${5 * s} ${8 * s} Z`}
        fill={color === '#e44b2f' ? 'url(#fiba-cone-gradient)' : color}
        stroke="#3a1f10"
        strokeWidth="1"
      />
      <line x1={-10 * s} y1={8 * s} x2={10 * s} y2={8 * s} stroke="#000000" strokeWidth="2" />
      <line
        x1={-10 * s}
        y1={8 * s + 4}
        x2={10 * s}
        y2={8 * s + 4}
        stroke="#f00000"
        strokeWidth="2"
      />
    </g>
  );
}

export function CoachShape({ element }: { element: CoachElement }): React.ReactElement {
  const { x, y, color } = element;
  const r = 42;
  return (
    <g transform={`translate(${x} ${y})`} data-role="shape">
      <circle r={r} fill="#ffffff" stroke={color} strokeWidth="5" />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="46"
        fontWeight="800"
        fill={color}
      >
        C
      </text>
    </g>
  );
}

export function TextShape({ element }: { element: TextElement }): React.ReactElement {
  const { x, y, text, color, size } = element;
  /* Preserve multi-line input — every \n produces a new <tspan> stacked
   * vertically and centred on the element anchor. The whole block is then
   * shifted up by half its total height so the centre of the text (not the
   * first line) stays at (x, y). */
  const lines = (text || 'T').split('\n');
  const lineHeight = size * 1.2;
  const blockHeight = lines.length * lineHeight;
  const firstY = -blockHeight / 2 + lineHeight / 2;
  return (
    <g transform={`translate(${x} ${y})`} data-role="shape">
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize={size}
        fontWeight="700"
        fill={color}
        stroke="#ffffff"
        strokeWidth="6"
        paintOrder="stroke fill"
      >
        {lines.map((line, i) => (
          <tspan key={i} x={0} y={firstY + i * lineHeight}>
            {line || ' '}
          </tspan>
        ))}
      </text>
    </g>
  );
}

/* ---------------- Arrow variants ---------------- */

interface ArrowPathProps {
  element: ArrowElement;
}

function buildPolyPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

/** Build a smooth curved path through all points using quadratic Béziers
 * whose control point is each interior point and whose anchors are the
 * midpoints of adjacent segments. Produces smooth curves that still pass
 * near every point — ideal after simplification. A small straight tail is
 * appended at the end so the marker-end arrow has a defined orientation. */
export function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  const out: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    out.push(`Q ${a.x} ${a.y} ${mx} ${my}`);
  }
  const last = points[points.length - 1];
  out.push(`T ${last.x} ${last.y}`);
  return out.join(' ');
}

/** Sample a smooth curve along the base points so we can decorate it with a
 * secondary wave pattern (used for the dribble). Returns a dense polyline
 * approximation of the same curve `buildSmoothPath` renders. */
function sampleSmoothCurve(
  points: Array<{ x: number; y: number }>,
  step = 6
): Array<{ x: number; y: number }> {
  if (points.length < 2) return points.slice();
  if (points.length === 2) {
    const [a, b] = points;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const n = Math.max(2, Math.ceil(len / step));
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
    return out;
  }
  // Quadratic Béziers: control = points[i], anchors = midpoints between
  // adjacent points (same scheme as buildSmoothPath).
  const out: Array<{ x: number; y: number }> = [];
  let prevAnchor = points[0];
  out.push(prevAnchor);
  for (let i = 1; i < points.length - 1; i++) {
    const ctrl = points[i];
    const next = points[i + 1];
    const midNext = { x: (ctrl.x + next.x) / 2, y: (ctrl.y + next.y) / 2 };
    // Approximate chord length to choose sample count
    const approx =
      Math.hypot(ctrl.x - prevAnchor.x, ctrl.y - prevAnchor.y) +
      Math.hypot(midNext.x - ctrl.x, midNext.y - ctrl.y);
    const n = Math.max(4, Math.ceil(approx / step));
    for (let s = 1; s <= n; s++) {
      const t = s / n;
      const omt = 1 - t;
      const x = omt * omt * prevAnchor.x + 2 * omt * t * ctrl.x + t * t * midNext.x;
      const y = omt * omt * prevAnchor.y + 2 * omt * t * ctrl.y + t * t * midNext.y;
      out.push({ x, y });
    }
    prevAnchor = midNext;
  }
  // Final segment: from the last midpoint anchor to the last base point.
  const lastCtrl = points[points.length - 2];
  const end = points[points.length - 1];
  const approx =
    Math.hypot(lastCtrl.x - prevAnchor.x, lastCtrl.y - prevAnchor.y) +
    Math.hypot(end.x - lastCtrl.x, end.y - lastCtrl.y);
  const n = Math.max(4, Math.ceil(approx / step));
  for (let s = 1; s <= n; s++) {
    const t = s / n;
    const omt = 1 - t;
    const x = omt * omt * prevAnchor.x + 2 * omt * t * lastCtrl.x + t * t * end.x;
    const y = omt * omt * prevAnchor.y + 2 * omt * t * lastCtrl.y + t * t * end.y;
    out.push({ x, y });
  }
  return out;
}

/** FIBA-style dribble path: tight alternating loops wrapped around the base
 * curve. Generated by sampling the smooth curve and offsetting waypoints
 * perpendicular to the tangent by an amplitude greater than half the
 * wavelength — the resulting quadratic Béziers form visible cusps/loops. */
function buildDribblePath(
  points: Array<{ x: number; y: number }>,
  opts: { amp?: number; wavelength?: number; tailStraight?: number } = {}
): string {
  if (points.length < 2) return '';
  const { amp = 18, wavelength = 44, tailStraight = 24 } = opts;
  const samples = sampleSmoothCurve(points, 4);
  if (samples.length < 2) return '';

  // Total length of the sampled curve
  let total = 0;
  const segLens: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    const d = Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y);
    segLens.push(d);
    total += d;
  }
  if (total === 0) return '';

  // Generate alternating offset waypoints every half-wavelength.
  // Leave a small straight tail at the end so the arrow-head direction
  // is clean (no swirl at the tip).
  const halfWave = wavelength / 2;
  const tailAt = Math.max(0, total - tailStraight);
  const waypoints: Array<{ x: number; y: number }> = [];
  waypoints.push(samples[0]);
  let sign = 1;
  let dist = 0;
  let target = halfWave;
  outer: for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    const segLen = segLens[i - 1];
    if (segLen === 0) continue;
    const ux = (b.x - a.x) / segLen;
    const uy = (b.y - a.y) / segLen;
    while (target <= dist + segLen) {
      if (target >= tailAt) break outer;
      const t = (target - dist) / segLen;
      const px = a.x + (b.x - a.x) * t;
      const py = a.y + (b.y - a.y) * t;
      // Perpendicular (left) = (-uy, ux)
      waypoints.push({
        x: px + -uy * amp * sign,
        y: py + ux * amp * sign,
      });
      sign *= -1;
      target += halfWave;
    }
    dist += segLen;
  }
  // Append the last base sample so the arrow-head lands exactly at the tip
  // and the final segment is straight (better marker orientation).
  waypoints.push(samples[samples.length - 1]);

  // Smooth curve through all waypoints. Because consecutive waypoints sit on
  // opposite sides of the centreline with |amp| > wavelength/2, the resulting
  // quadratic Béziers naturally form small cusps/loops — exactly the FIBA
  // "curly" dribble look.
  return buildSmoothPath(waypoints);
}

export function EditorDefs(): React.ReactElement {
  return (
    <>
      <radialGradient cx="0.6" cy="0.4" r="0.5" id="fiba-ball-gradient">
        <stop offset="0%" stopColor="#ffcaa6" />
        <stop offset="75%" stopColor="#d54800" />
        <stop offset="100%" stopColor="#8d3d17" />
      </radialGradient>
      <linearGradient x1="0" y1="0.5" x2="1" y2="0.5" id="fiba-cone-gradient">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#ff7f7f" />
        <stop offset="100%" stopColor="#f00000" />
      </linearGradient>
      <ArrowHeadDefs />
    </>
  );
}

export function ArrowHeadDefs(): React.ReactElement {
  return (
    <>
      <marker
        id="arrowhead-solid"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="4"
        markerHeight="4"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
      </marker>
      <marker
        id="arrowhead-open"
        viewBox="0 0 12 12"
        refX="11"
        refY="6"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      >
        <path d="M 1 1 L 11 6 L 1 11 Z" fill="#ffffff" stroke="context-stroke" strokeWidth="1.3" />
      </marker>
    </>
  );
}

export function ArrowShape({ element }: ArrowPathProps): React.ReactElement {
  const { variant, color, points } = element;
  if (points.length < 2) return <g />;
  const last = points[points.length - 1];
  const prev = points[points.length - 2];

  const common = {
    fill: 'none',
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (variant) {
    case 'movement':
      return (
        <path
          {...common}
          strokeWidth="8"
          markerEnd="url(#arrowhead-solid)"
          d={buildSmoothPath(points)}
          data-role="shape"
        />
      );
    case 'passing': {
      /* Passing lines are always straight: first→last only. */
      const first = points[0];
      return (
        <path
          {...common}
          strokeWidth="8"
          strokeDasharray="22 14"
          markerEnd="url(#arrowhead-solid)"
          d={`M ${first.x} ${first.y} L ${last.x} ${last.y}`}
          data-role="shape"
        />
      );
    }
    case 'dribbling':
      return (
        <path
          {...common}
          strokeWidth="7"
          markerEnd="url(#arrowhead-solid)"
          d={buildDribblePath(points)}
          data-role="shape"
        />
      );
    case 'line':
      return <path {...common} strokeWidth="8" d={buildSmoothPath(points)} data-role="shape" />;
    case 'screen': {
      const dx = last.x - prev.x;
      const dy = last.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const bar = 34;
      return (
        <g data-role="shape">
          <path {...common} strokeWidth="8" d={buildSmoothPath(points)} />
          <line
            x1={last.x + nx * bar}
            y1={last.y + ny * bar}
            x2={last.x - nx * bar}
            y2={last.y - ny * bar}
            stroke={color}
            strokeWidth="11"
            strokeLinecap="round"
          />
        </g>
      );
    }
    default:
      return <g />;
  }
}

export function AreaShape({ element }: { element: AreaElement }): React.ReactElement {
  const { x, y, width, height, color, opacity, variant } = element;
  const hw = width / 2;
  const hh = height / 2;
  const fill = color;
  const stroke = '#333333';
  const op = opacity ?? 0.45;
  switch (variant) {
    case 'circle':
      return (
        <ellipse
          cx={x}
          cy={y}
          rx={hw}
          ry={hh}
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          opacity={op}
          data-role="shape"
        />
      );
    case 'square':
      return (
        <rect
          x={x - hw}
          y={y - hh}
          width={width}
          height={height}
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          opacity={op}
          data-role="shape"
        />
      );
    case 'triangle':
      return (
        <path
          d={`M ${x} ${y - hh}
              L ${x + hw} ${y + hh}
              L ${x - hw} ${y + hh} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          opacity={op}
          data-role="shape"
        />
      );
    default:
      return <g />;
  }
}

/* FIBA key / restricted area: 4.9 m wide × 5.8 m deep, centred on the basket
 * on each side of the court. A shot placed inside this box is a close-range
 * attempt and should be drawn smaller; shots from outside the painted area
 * (mid-range and 3-point) get the full-size arrow. */
const KEY_HALF_WIDTH = 245;
const KEY_DEPTH = 580;
const FULL_COURT_H = 2800;

function isInsideKey(x: number, y: number, basket: { x: number; y: number }): boolean {
  if (Math.abs(x - basket.x) > KEY_HALF_WIDTH) return false;
  // Depth is measured from the endline behind the basket, regardless of
  // whether we're on the top or bottom half of a full court.
  const depthFromEndline = basket.y < FULL_COURT_H / 2 ? y : FULL_COURT_H - y;
  return depthFromEndline >= 0 && depthFromEndline <= KEY_DEPTH;
}

export function ShootingShape({
  element,
  basket,
}: {
  element: ShootingElement;
  basket?: { x: number; y: number } | null;
}): React.ReactElement {
  const { x, y, color } = element;
  /* The "tack" glyph in the source SVG points up (-Y) when untransformed
   * (tip at y = -25, fork at y = +13). SVG `rotate(θ)` is clockwise
   * positive, so to rotate "up" onto an arbitrary vector (dx, dy) we use
   *     θ = atan2(dx, -dy)
   * which gives 0° when the target is directly above and 90° when it is
   * directly to the right — exactly what we want. */
  let rotation = 0;
  if (basket) {
    const dx = basket.x - x;
    const dy = basket.y - y;
    rotation = (Math.atan2(dx, -dy) * 180) / Math.PI;
  }
  /* Size depends on where the shot is taken from — smaller inside the key
   * (close range, lay-ups) and full-size from everywhere else (mid-range /
   * 3-point), matching the FIBA editor convention. */
  const inKey = basket ? isInsideKey(x, y, basket) : false;
  const scale = inKey ? 2.5 : 4.2;
  /* Path coordinates are taken verbatim from the FIBA editor. Note the
   * lowercase `m` — every command after the initial move is RELATIVE, which
   * yields the "fork + shaft + arrow tip" silhouette (tip at y≈-39, fork at
   * y≈-12). An uppercase M here would draw a completely different polygon. */
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}
      data-role="shape"
      fill="#ffffff"
      stroke={color}
      strokeWidth="1.2"
      strokeLinejoin="miter"
    >
      <path d="m -9,-25 8,-14 8,14 -4,0 0,13 -7.5,0 0,-13 z" />
    </g>
  );
}

export function HandoffShape({ element }: { element: HandoffElement }): React.ReactElement {
  const { x, y, color } = element;
  /* H-shape marker (FIBA btnHandoff), scaled ×3.5. */
  return (
    <g transform={`translate(${x} ${y})`} data-role="shape">
      <path
        d="M -28,0 H 28 M 14,-28 V 28 M -14,-28 V 28"
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
      />
    </g>
  );
}

export function DrillElementShape({
  element,
  fullCourt = false,
}: {
  element: DrillElement;
  fullCourt?: boolean;
}): React.ReactElement {
  switch (element.kind) {
    case 'player':
      return <PlayerShape element={element} />;
    case 'ball':
      return <BallShape element={element} />;
    case 'cone':
      return <ConeShape element={element} />;
    case 'coach':
      return <CoachShape element={element} />;
    case 'text':
      return <TextShape element={element} />;
    case 'arrow':
      return <ArrowShape element={element} />;
    case 'area':
      return <AreaShape element={element} />;
    case 'shooting':
      return (
        <ShootingShape element={element} basket={basketForShot(element.x, element.y, fullCourt)} />
      );
    case 'handoff':
      return <HandoffShape element={element} />;
    default:
      return <g />;
  }
}

export function elementBBox(element: DrillElement): {
  cx: number;
  cy: number;
  w: number;
  h: number;
} | null {
  switch (element.kind) {
    case 'player':
      if (element.team === 'defense') {
        /* The bounding box is rotation-agnostic (a simple square centred on
         * the player) so the selection rect hugs the defender no matter
         * which way the chevron is pointing. */
        return { cx: element.x, cy: element.y - 8, w: 230, h: 230 };
      }
      return { cx: element.x, cy: element.y, w: PLAYER_R * 2 + 16, h: PLAYER_R * 2 + 16 };
    case 'ball':
      return { cx: element.x, cy: element.y, w: 70, h: 70 };
    case 'cone':
      return { cx: element.x, cy: element.y - 10, w: 110, h: 110 };
    case 'coach':
      return { cx: element.x, cy: element.y, w: 96, h: 96 };
    case 'text': {
      const lines = (element.text || 'T').split('\n');
      const longest = lines.reduce((m, l) => Math.max(m, l.length), 1);
      return {
        cx: element.x,
        cy: element.y,
        w: element.size * longest * 0.6 + 16,
        h: element.size * 1.2 * lines.length + 8,
      };
    }
    case 'arrow': {
      if (element.points.length === 0) return null;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of element.points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      const padding = 10;
      return {
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
        w: maxX - minX + padding * 2,
        h: maxY - minY + padding * 2,
      };
    }
    case 'area':
      return { cx: element.x, cy: element.y, w: element.width + 12, h: element.height + 12 };
    case 'shooting':
      /* Square BB sized for the larger, outside-the-key variant of the
       * shot arrow (~76×164 px at scale 4.2). We use the bounding square
       * that survives any rotation around the anchor point. */
      return { cx: element.x, cy: element.y, w: 170, h: 170 };
    case 'handoff':
      return { cx: element.x, cy: element.y, w: 70, h: 70 };
    default:
      return null;
  }
}

/**
 * Pure, stateless renderer for a drill graphic. Draws the FIBA court followed
 * by every element in the `RENDER_ORDER`. This component does NOT touch any
 * editor-only UI (selection handles, preview arrows, etc.) — it is used both
 * to produce read-only previews and to freshly re-render archived graphics
 * whenever the club's court theme changes.
 */
export function DrillGraphicSvg({
  state,
  theme,
}: {
  state: EditorState;
  theme?: CourtTheme;
}): React.ReactElement {
  const fullCourt = !!state.fullCourt;
  return (
    <>
      <defs>
        <EditorDefs />
      </defs>
      <FibaCourt full={fullCourt} theme={theme} />
      {RENDER_ORDER.map((kind) => {
        const items = state.elements.filter((el) => el.kind === kind);
        if (items.length === 0) return null;
        return (
          <g key={kind} className={GROUP_CLASS[kind]}>
            {items.map((el) => (
              <DrillElementShape key={el.id} element={el} fullCourt={fullCourt} />
            ))}
          </g>
        );
      })}
    </>
  );
}

/**
 * Produce a stand-alone `<svg>` string from a saved `EditorState` and the
 * currently-active club theme. Because the court markup is rebuilt on every
 * call, old graphics automatically pick up new colours/patterns the moment
 * the user changes them in the club settings — nothing needs re-saving.
 */
export function renderDrillGraphicSvg({
  state,
  theme,
}: {
  state: EditorState;
  theme?: CourtTheme;
}): string {
  const viewBox = courtViewBox(!!state.fullCourt);
  /* The children are rendered inside a real <svg> root so React recognises
   * <linearGradient>, <clipPath>, etc. as SVG elements (not unknown HTML
   * tags). Without this wrapper, renderToStaticMarkup logs casing warnings
   * because those tags only get their SVG namespace when nested under
   * <svg>. */
  return renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
      <DrillGraphicSvg state={state} theme={theme} />
    </svg>
  );
}
