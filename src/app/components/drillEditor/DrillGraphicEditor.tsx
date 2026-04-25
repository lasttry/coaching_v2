'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import SaveIcon from '@mui/icons-material/Save';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';

import { useClub } from '@/hooks/useClubs';
import { useRecentColors, useSaveRecentColors, type RecentColor } from '@/hooks/useRecentColors';

import {
  EditorDefs,
  DrillElementShape,
  elementBBox,
  renderDrillGraphicSvg,
} from './ElementRenderer';
import {
  FibaCourt,
  courtViewBox,
  courtBounds,
  COURT_W,
  HALF_H,
  FULL_H,
  type CourtTheme,
} from './FibaCourt';
import {
  BASIC_COLORS,
  DEFAULT_TOOL_COLORS,
  LINE_TOOLS,
  colorKeyForTool,
  type ColorKey,
  type ToolId,
} from './constants';
import {
  AreaIcon,
  BallIcon,
  ChevronLeftIconSvg,
  ChevronRightIconSvg,
  CoachIcon,
  ConeIcon,
  DefenseIcon,
  DownloadIconSvg,
  EraserIcon,
  HalfCourtIcon,
  HandoffIcon,
  LineDribblingIcon,
  LineMovementIcon,
  LinePassingIcon,
  LinePlainIcon,
  LineScreenIcon,
  MenuIconSvg,
  OffenseIcon,
  PaletteIconSvg,
  SelectIcon,
  ShootingIcon,
  TextIcon,
  UndoIconSvg,
} from './ToolIcons';
import { buildMetadataTag, parseEditorState } from './serialize';
import {
  GROUP_CLASS,
  RENDER_ORDER,
  createId,
  type AreaElement,
  type AreaVariant,
  type ArrowElement,
  type ArrowVariant,
  type DrillElement,
  type EditorState,
} from './types';

interface Props {
  initialSvg?: string | null;
  onSave: (payload: { svg: string; state: EditorState }) => void | Promise<void>;
  onClose: () => void;
  title?: string;
  saving?: boolean;
  /**
   * Notified whenever the in-memory editor state diverges from the
   * `initialSvg` snapshot (or the empty default when starting fresh).
   * Lets the parent show a "discard changes?" prompt when the dialog is
   * about to close with unsaved edits.
   */
  onDirtyChange?: (dirty: boolean) => void;
}

const UNDO_LIMIT = 50;

function defaultState(): EditorState {
  return { version: 1, fullCourt: false, elements: [] };
}

function cloneState(state: EditorState): EditorState {
  return { ...state, elements: state.elements.map((e) => ({ ...e })) };
}

const AREA_VARIANTS: AreaVariant[] = ['circle', 'square', 'triangle'];

const MIN_AREA_DIM = 30;

/**
 * Build a transient "ghost" element used to preview what a placement tool
 * would drop at the cursor. Returns null for tools that don't place anything
 * (select, eraser) and for line tools (which already use a drag-to-draw
 * preview via `arrowInProgress`). The preview element uses a synthetic id so
 * it never clashes with real content — it is only ever rendered, never saved.
 */
function buildToolPreview(
  tool: ToolId,
  p: { x: number; y: number },
  ctx: {
    nextOffense: number;
    nextDefense: number;
    toolColors: Record<ColorKey, string>;
    areaVariant: AreaVariant;
  }
): DrillElement | null {
  const c = ctx.toolColors;
  switch (tool) {
    case 'offense':
      return {
        id: '__preview',
        kind: 'player',
        team: 'offense',
        number: ctx.nextOffense,
        x: p.x,
        y: p.y,
        color: c.offense,
      };
    case 'defense':
      return {
        id: '__preview',
        kind: 'player',
        team: 'defense',
        number: ctx.nextDefense,
        x: p.x,
        y: p.y,
        color: c.defense,
      };
    case 'ball':
      return { id: '__preview', kind: 'ball', x: p.x, y: p.y };
    case 'cone':
      return { id: '__preview', kind: 'cone', x: p.x, y: p.y, color: c.cone };
    case 'coach':
      return {
        id: '__preview',
        kind: 'coach',
        x: p.x,
        y: p.y,
        color: c.coach,
      };
    case 'text':
      return {
        id: '__preview',
        kind: 'text',
        x: p.x,
        y: p.y,
        text: 'T',
        color: c.text,
        size: 42,
      };
    case 'area':
      return {
        id: '__preview',
        kind: 'area',
        variant: ctx.areaVariant,
        x: p.x,
        y: p.y,
        width: 180,
        height: 180,
        color: c.area,
        opacity: 0.45,
      };
    case 'shooting':
      return {
        id: '__preview',
        kind: 'shooting',
        x: p.x,
        y: p.y,
        color: c.line,
      };
    case 'handoff':
      return {
        id: '__preview',
        kind: 'handoff',
        x: p.x,
        y: p.y,
        color: c.line,
      };
    default:
      return null;
  }
}

/** Perpendicular distance from point p to line (a,b). */
function perpDist(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  return Math.abs((dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len);
}

/** Ramer–Douglas–Peucker path simplification. Returns a new array that
 * always includes the first and last points and keeps only the points
 * whose perpendicular distance to the running line exceeds `tolerance`. */
function simplifyRDP(
  points: Array<{ x: number; y: number }>,
  tolerance: number
): Array<{ x: number; y: number }> {
  if (points.length <= 2) return points.slice();
  let maxD = 0;
  let idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], points[0], points[points.length - 1]);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD > tolerance) {
    const left = simplifyRDP(points.slice(0, idx + 1), tolerance);
    const right = simplifyRDP(points.slice(idx), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
}

function resizeArea(
  el: AreaElement,
  edge: 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se',
  anchorX: number,
  anchorY: number,
  px: number,
  py: number
): AreaElement {
  let newX = el.x;
  let newY = el.y;
  let newW = el.width;
  let newH = el.height;

  if (edge.includes('e')) {
    newW = Math.max(MIN_AREA_DIM, px - anchorX);
    newX = anchorX + newW / 2;
  }
  if (edge.includes('w')) {
    newW = Math.max(MIN_AREA_DIM, anchorX - px);
    newX = anchorX - newW / 2;
  }
  if (edge.includes('s')) {
    newH = Math.max(MIN_AREA_DIM, py - anchorY);
    newY = anchorY + newH / 2;
  }
  if (edge.includes('n')) {
    newH = Math.max(MIN_AREA_DIM, anchorY - py);
    newY = anchorY - newH / 2;
  }

  // For pure N/S edges keep width unchanged, for pure E/W edges keep height unchanged
  if (edge === 'n' || edge === 's') {
    newW = el.width;
    newX = el.x;
  }
  if (edge === 'e' || edge === 'w') {
    newH = el.height;
    newY = el.y;
  }

  return { ...el, x: newX, y: newY, width: newW, height: newH };
}

function isLineTool(t: ToolId): t is 'movement' | 'passing' | 'dribbling' | 'screen' | 'line' {
  return (LINE_TOOLS as ToolId[]).includes(t);
}

function toolToVariant(t: ToolId): ArrowVariant {
  switch (t) {
    case 'movement':
    case 'passing':
    case 'dribbling':
    case 'screen':
    case 'line':
      return t;
    default:
      return 'movement';
  }
}

/* ---------------- Main component ---------------- */

export default function DrillGraphicEditor({
  initialSvg,
  onSave,
  onClose,
  title,
  saving,
  onDirtyChange,
}: Props): React.ReactElement {
  const { t } = useTranslation();

  const [state, setState] = useState<EditorState>(() => {
    const parsed = parseEditorState(initialSvg);
    return parsed ?? defaultState();
  });

  // Snapshot of the state at mount time used to detect whether the user
  // has actually drawn / changed anything. Stored as a string so equality
  // checks stay cheap regardless of how many elements live on the canvas.
  const initialStateSignatureRef = React.useRef<string>(JSON.stringify(state));
  React.useEffect(() => {
    if (!onDirtyChange) return;
    onDirtyChange(JSON.stringify(state) !== initialStateSignatureRef.current);
  }, [state, onDirtyChange]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolId>('select');
  /** Switch to a different tool and clear whatever was selected so the
   * overlay disappears immediately. Picking a new tool in the FIBA editor
   * always "lets go" of the current element — feels more predictable than
   * keeping a faint handle around while the user is clearly about to draw
   * something else. */
  const selectTool = useCallback((next: ToolId) => {
    setTool(next);
    setSelectedId(null);
  }, []);
  /* Client-only zoom level for the canvas. Multiplies the base maxWidth of
   * the SVG so users can magnify the court to draw fine details. Never
   * persisted — the saved SVG always uses the intrinsic court size. */
  const [zoom, setZoom] = useState(1);
  const ZOOM_MIN = 0.6;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 0.25;
  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100));
  const zoomReset = () => setZoom(1);
  /* Per-tool colour memory. Each placement tool has its own "last picked"
   * colour so switching between tools doesn't clobber the user's previous
   * choice (e.g. setting offence to red shouldn't change the defence). */
  const [toolColors, setToolColors] = useState<Record<ColorKey, string>>(DEFAULT_TOOL_COLORS);
  /* Recent (and pinned) custom colours live on the user's account so they
   * survive across devices and sessions. Pinned entries are kept forever;
   * unpinned ones age out FIFO when the list exceeds MAX_TEMP_RECENTS. */
  const { data: recentColorsData } = useRecentColors();
  const { mutate: saveRecentColors } = useSaveRecentColors();
  const recentColors: RecentColor[] = useMemo(
    () => recentColorsData?.colors ?? [],
    [recentColorsData]
  );
  const [nextOffense, setNextOffense] = useState<number>(1);
  const [nextDefense, setNextDefense] = useState<number>(1);
  const [areaVariant, setAreaVariant] = useState<AreaVariant>('circle');
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setTheme] = useState<CourtTheme>({});
  const [showLogo, setShowLogo] = useState<boolean>(true);

  /* Load the active club so we can pre-populate the court theme and display
   * the club crest in the centre circle by default. */
  const { data: session } = useSession();
  const selectedClubId = session?.user?.selectedClubId ?? null;
  const { data: club } = useClub(selectedClubId);

  /* Read-only copy of the club's saved court theme. All colour editing now
   * lives in the club settings page so we only consume here. */
  const clubTheme: CourtTheme = useMemo(
    () => ({
      background: club?.courtBackground ?? null,
      keyFill: club?.courtKeyColor ?? null,
      centerFill: club?.courtCenterColor ?? null,
      lineColor: club?.courtLineColor ?? null,
      marginColor: club?.courtMarginColor ?? null,
      centerLogoRotation: club?.courtLogoRotation ?? 90,
    }),
    [
      club?.courtBackground,
      club?.courtKeyColor,
      club?.courtCenterColor,
      club?.courtLineColor,
      club?.courtMarginColor,
      club?.courtLogoRotation,
    ]
  );

  /* Sync the local "show logo" toggle with the club's preference once it loads. */
  useEffect(() => {
    if (club?.courtShowLogo !== undefined) setShowLogo(!!club.courtShowLogo);
  }, [club?.courtShowLogo]);

  /* Effective theme passed to <FibaCourt />: club theme + per-drill logo toggle. */
  const effectiveTheme: CourtTheme = useMemo(
    () => ({
      ...clubTheme,
      ...theme,
      centerLogoUrl: showLogo && club?.image ? club.image : null,
    }),
    [clubTheme, theme, showLogo, club?.image]
  );

  /* The "active" colour shown in the picker is the one that belongs to the
   * current tool's bucket. For the pointer ("select") and eraser tools we
   * fall back to the line colour so the picker has a sensible value. */
  const activeColorKey: ColorKey = colorKeyForTool(tool);
  const activeColor = toolColors[activeColorKey];

  /* Cap on how many UNPINNED colours we keep around. Pinned entries are
   * never evicted. 8 matches the "couple of rows" look we want in the UI. */
  const MAX_TEMP_RECENTS = 8;

  const isSameColor = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

  /** Commit a colour that was just *applied* to a real element. Basic
   * swatches are ignored; already-present entries are left alone. New
   * custom colours are inserted at the top of the unpinned group and the
   * oldest unpinned entries are evicted FIFO-style once the temp cap is
   * exceeded. */
  const commitUsedColor = useCallback(
    (c: string) => {
      if (!c || BASIC_COLORS.some((b) => isSameColor(b, c))) return;
      const existing = recentColors.find((r) => isSameColor(r.color, c));
      if (existing) return; // Already tracked — nothing to do.
      const pinned = recentColors.filter((r) => r.pinned);
      const temp = recentColors.filter((r) => !r.pinned);
      const nextTemp = [{ color: c, pinned: false }, ...temp].slice(0, MAX_TEMP_RECENTS);
      saveRecentColors([...pinned, ...nextTemp]);
    },
    [recentColors, saveRecentColors]
  );

  const toggleRecentPinned = useCallback(
    (c: string) => {
      const next = recentColors.map((r) =>
        isSameColor(r.color, c) ? { ...r, pinned: !r.pinned } : r
      );
      saveRecentColors(next);
    },
    [recentColors, saveRecentColors]
  );

  const removeRecentColor = useCallback(
    (c: string) => {
      saveRecentColors(recentColors.filter((r) => !isSameColor(r.color, c)));
    },
    [recentColors, saveRecentColors]
  );

  /* Arrow-drawing state: while the pointer is held down during a line tool,
   * we accumulate points as the user drags (freehand). */
  const [arrowInProgress, setArrowInProgress] = useState<ArrowElement | null>(null);
  const arrowDrawingRef = useRef<boolean>(false);

  /* Pointer position (in SVG units) while hovering the canvas. Used to render
   * a ghost preview of the element that would be placed by the active tool,
   * the same way the FIBA editor previews each tool next to the cursor. */
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);

  /* Drag state — either moving or resizing an area shape.
   * Resize mode stores which edge(s) are being dragged AND the opposite anchor
   * (fixed point in SVG units) so the opposite side stays put while the grabbed
   * side follows the pointer.
   */
  type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';
  const dragRef = useRef<
    | { id: string; mode: 'move'; dx: number; dy: number }
    | {
        id: string;
        mode: 'resize';
        edge: ResizeEdge;
        anchorX: number;
        anchorY: number;
      }
    | { id: string; mode: 'point'; pointIndex: number }
    | { id: string; mode: 'rotate'; cx: number; cy: number }
    | null
  >(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  /* Current pointer position in SVG coordinates — used so that the "add
   * point on selected line" keyboard shortcut knows where to insert. */
  const lastSvgPointRef = useRef<{ x: number; y: number } | null>(null);

  /* Undo/Redo */
  const undoStack = useRef<EditorState[]>([]);
  const redoStack = useRef<EditorState[]>([]);

  const pushHistory = useCallback((prev: EditorState) => {
    undoStack.current.push(cloneState(prev));
    if (undoStack.current.length > UNDO_LIMIT) undoStack.current.shift();
    redoStack.current = [];
  }, []);

  const applyState = useCallback(
    (updater: (prev: EditorState) => EditorState) => {
      setState((prev) => {
        pushHistory(prev);
        return updater(prev);
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    const last = undoStack.current.pop();
    if (!last) return;
    setState((curr) => {
      redoStack.current.push(cloneState(curr));
      return last;
    });
    setSelectedId(null);
  }, []);

  /* ---------------- Coordinate helpers ---------------- */

  const getSvgPoint = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  }, []);

  /* ---------------- Element manipulation ---------------- */

  const addElement = useCallback(
    (el: DrillElement) => {
      applyState((prev) => ({ ...prev, elements: [...prev.elements, el] }));
      setSelectedId(el.id);
      // Any non-basic colour that reaches the canvas counts as "used" and is
      // worth remembering for the next time the user opens the picker.
      if (el.kind !== 'ball' && 'color' in el && typeof el.color === 'string') {
        commitUsedColor(el.color);
      }
    },
    [applyState, commitUsedColor]
  );

  const updateSelected = useCallback(
    (updater: (el: DrillElement) => DrillElement, pushUndo = true) => {
      if (!selectedId) return;
      const apply = (prev: EditorState): EditorState => ({
        ...prev,
        elements: prev.elements.map((e) => (e.id === selectedId ? updater(e) : e)),
      });
      if (pushUndo) applyState(apply);
      else setState(apply);
    },
    [applyState, selectedId]
  );

  /** Apply a colour pick: remember it for the current tool and, if something
   * is selected, recolour it too. Recent-colour bookkeeping happens only
   * once the colour actually lands on an element (see `commitUsedColor`
   * calls in `addElement` and further below). That way merely fiddling
   * with the picker doesn't pollute the user's saved list. */
  const pickColor = useCallback(
    (c: string) => {
      setToolColors((prev) => ({ ...prev, [activeColorKey]: c }));
      if (selectedId) {
        updateSelected((el) => {
          if (el.kind === 'ball') return el;
          return { ...el, color: c } as DrillElement;
        });
        commitUsedColor(c);
      }
    },
    [activeColorKey, commitUsedColor, selectedId, updateSelected]
  );

  const deleteElement = useCallback(
    (id: string) => {
      applyState((prev) => ({
        ...prev,
        elements: prev.elements.filter((e) => e.id !== id),
      }));
      setSelectedId((s) => (s === id ? null : s));
    },
    [applyState]
  );

  /* ---------------- Canvas event handlers ---------------- */

  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const p = getSvgPoint(e);
    if (!p) return;

    if (tool === 'select') {
      // clicks on empty area: clear selection
      setSelectedId(null);
      return;
    }

    if (tool === 'eraser') {
      setSelectedId(null);
      return;
    }

    if (isLineTool(tool)) {
      // Start a freehand drawing: points grow on pointer move until release.
      const initial: ArrowElement = {
        id: createId('arrow'),
        kind: 'arrow',
        variant: toolToVariant(tool),
        color: toolColors.line,
        points: [p],
      };
      setArrowInProgress(initial);
      arrowDrawingRef.current = true;
      svgRef.current?.setPointerCapture?.(e.pointerId);
      return;
    }

    if (tool === 'offense') {
      const number = nextOffense;
      addElement({
        id: createId('player'),
        kind: 'player',
        team: 'offense',
        number,
        x: p.x,
        y: p.y,
        color: toolColors.offense,
      });
      setNextOffense((n) => n + 1);
      return;
    }

    if (tool === 'defense') {
      const number = nextDefense;
      addElement({
        id: createId('player'),
        kind: 'player',
        team: 'defense',
        number,
        x: p.x,
        y: p.y,
        color: toolColors.defense,
      });
      setNextDefense((n) => n + 1);
      return;
    }

    if (tool === 'ball') {
      addElement({ id: createId('ball'), kind: 'ball', x: p.x, y: p.y });
      return;
    }

    if (tool === 'cone') {
      addElement({ id: createId('cone'), kind: 'cone', x: p.x, y: p.y, color: toolColors.cone });
      return;
    }

    if (tool === 'coach') {
      addElement({ id: createId('coach'), kind: 'coach', x: p.x, y: p.y, color: toolColors.coach });
      return;
    }

    if (tool === 'text') {
      addElement({
        id: createId('text'),
        kind: 'text',
        x: p.x,
        y: p.y,
        text: 'T',
        color: toolColors.text,
        size: 42,
      });
      return;
    }

    if (tool === 'area') {
      addElement({
        id: createId('area'),
        kind: 'area',
        variant: areaVariant,
        x: p.x,
        y: p.y,
        width: 180,
        height: 180,
        color: toolColors.area,
        opacity: 0.45,
      });
      return;
    }

    if (tool === 'shooting') {
      addElement({
        id: createId('shoot'),
        kind: 'shooting',
        x: p.x,
        y: p.y,
        color: toolColors.line,
      });
      return;
    }

    if (tool === 'handoff') {
      addElement({
        id: createId('handoff'),
        kind: 'handoff',
        x: p.x,
        y: p.y,
        color: toolColors.line,
      });
      return;
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = getSvgPoint(e);
    if (!p) return;
    lastSvgPointRef.current = p;
    setHoverPoint(p);

    if (arrowInProgress && arrowDrawingRef.current) {
      // Freehand: append a new point every ~18 units of movement.
      setArrowInProgress((prev) => {
        if (!prev) return prev;
        const last = prev.points[prev.points.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) < 18) return prev;
        return { ...prev, points: [...prev.points, p] };
      });
    }

    const drag = dragRef.current;
    if (!drag) return;
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => {
        if (el.id !== drag.id) return el;
        if (drag.mode === 'resize') {
          if (el.kind !== 'area') return el;
          return resizeArea(el, drag.edge, drag.anchorX, drag.anchorY, p.x, p.y);
        }
        if (drag.mode === 'point') {
          if (el.kind !== 'arrow') return el;
          const pts = el.points.slice();
          pts[drag.pointIndex] = { x: p.x, y: p.y };
          return { ...el, points: pts };
        }
        if (drag.mode === 'rotate') {
          if (el.kind !== 'player') return el;
          /* Convert the pointer position (in SVG units) to an angle around
           * the player centre. Because SVG `rotate(θ)` is CW positive and
           * the shape points "up" (−Y) at 0°, the angle we want is
           *     θ = atan2(dx, −dy)  (in degrees, CW from up).
           */
          const dx = p.x - drag.cx;
          const dy = p.y - drag.cy;
          const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
          return { ...el, rotation: Math.round(deg) };
        }
        if (el.kind === 'arrow') {
          const first = el.points[0];
          const ox = p.x - drag.dx - first.x;
          const oy = p.y - drag.dy - first.y;
          return {
            ...el,
            points: el.points.map((pt) => ({ x: pt.x + ox, y: pt.y + oy })),
          };
        }
        return { ...el, x: p.x - drag.dx, y: p.y - drag.dy };
      }),
    }));
  };

  const handleCanvasPointerUp = () => {
    // Finish freehand arrow drawing if active.
    if (arrowDrawingRef.current) {
      arrowDrawingRef.current = false;
      finishArrow();
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;

    /* Only the plain "move" gesture should trigger drag-to-delete — resizing,
     * rotating and editing a line point should never throw an element away
     * just because the pointer happened to leave the court. */
    if (drag.mode !== 'move') return;

    // If the dragged element was moved outside the court frame, delete it.
    const b = courtBounds(state.fullCourt);
    const el = state.elements.find((e) => e.id === drag.id);
    if (!el) return;
    const refPoint =
      el.kind === 'arrow'
        ? el.points[Math.floor(el.points.length / 2)]
        : { x: (el as { x: number }).x, y: (el as { y: number }).y };
    const inside =
      refPoint.x >= b.x && refPoint.x <= b.x + b.w && refPoint.y >= b.y && refPoint.y <= b.y + b.h;
    if (!inside) {
      deleteElement(drag.id);
    }
  };

  const finishArrow = useCallback(() => {
    if (!arrowInProgress) return;
    let pts = arrowInProgress.points;
    if (pts.length < 2) {
      setArrowInProgress(null);
      return;
    }
    // Passing lines are always straight — keep only endpoints.
    if (arrowInProgress.variant === 'passing') {
      pts = [pts[0], pts[pts.length - 1]];
    } else {
      // Simplify freehand paths with Ramer–Douglas–Peucker so we keep
      // only the points needed to describe the curve. Tolerance in SVG
      // units; lower = more detail.
      pts = simplifyRDP(pts, 10);
    }
    const final: ArrowElement = { ...arrowInProgress, points: pts };
    applyState((prev) => ({ ...prev, elements: [...prev.elements, final] }));
    setArrowInProgress(null);
    setSelectedId(final.id);
  }, [applyState, arrowInProgress]);

  const handleCanvasDoubleClick = () => {
    if (arrowInProgress) finishArrow();
  };

  /* ---------------- Element pointer interactions ---------------- */

  const onElementPointerDown = (e: React.PointerEvent<SVGGElement>, el: DrillElement) => {
    e.stopPropagation();

    if (tool === 'eraser') {
      deleteElement(el.id);
      return;
    }

    // Ignore clicks while drawing a line — so endpoints can snap to anything else.
    if (arrowInProgress) return;

    // Any tool other than eraser selects + drags the element.
    setSelectedId(el.id);
    const p = getSvgPoint(e as unknown as React.PointerEvent<SVGSVGElement>);
    if (!p) return;

    const anchor = el.kind === 'arrow' ? el.points[0] : { x: el.x, y: el.y };
    dragRef.current = { id: el.id, mode: 'move', dx: p.x - anchor.x, dy: p.y - anchor.y };
    undoStack.current.push(cloneState(state));
    (e.currentTarget as SVGGElement).setPointerCapture?.(e.pointerId);
  };

  const onArrowPointPointerDown = (
    e: React.PointerEvent<SVGCircleElement>,
    elId: string,
    pointIndex: number
  ) => {
    e.stopPropagation();
    // Alt/Shift-click on a point handle: remove that point (so long as there
    // are still at least two left — otherwise the line degenerates).
    if (e.altKey || e.shiftKey) {
      applyState((prev) => ({
        ...prev,
        elements: prev.elements.map((el) => {
          if (el.id !== elId || el.kind !== 'arrow') return el;
          if (el.points.length <= 2) return el;
          return {
            ...el,
            points: el.points.filter((_, i) => i !== pointIndex),
          };
        }),
      }));
      return;
    }
    undoStack.current.push(cloneState(state));
    dragRef.current = { id: elId, mode: 'point', pointIndex };
    (e.currentTarget as SVGCircleElement).setPointerCapture?.(e.pointerId);
  };

  /* Insert a new editable point on the selected arrow at the given pointer
   * position, projected onto the closest segment of the current polyline. */
  const insertPointAtPointer = useCallback(() => {
    if (!selectedId) return;
    const p = lastSvgPointRef.current;
    if (!p) return;
    applyState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => {
        if (el.id !== selectedId || el.kind !== 'arrow') return el;
        const pts = el.points;
        if (pts.length < 2) return el;
        // Find the segment with the closest perpendicular projection.
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len2 = dx * dx + dy * dy || 1;
          const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
          const qx = a.x + dx * t;
          const qy = a.y + dy * t;
          const d = Math.hypot(p.x - qx, p.y - qy);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        }
        // Place the new anchor exactly where the cursor is — same behaviour
        // as the FIBA editor.
        const newPoint = { x: Math.round(p.x), y: Math.round(p.y) };
        const newPoints = [...pts.slice(0, bestIdx + 1), newPoint, ...pts.slice(bestIdx + 1)];
        return { ...el, points: newPoints };
      }),
    }));
  }, [applyState, selectedId]);

  /* Remove the last clicked/closest point from the selected arrow.
   * Used as the keyboard equivalent of alt-click. The closest point to the
   * cursor is chosen so the user doesn't have to aim exactly on a handle. */
  const removePointAtPointer = useCallback(() => {
    if (!selectedId) return;
    const p = lastSvgPointRef.current;
    if (!p) return;
    applyState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => {
        if (el.id !== selectedId || el.kind !== 'arrow') return el;
        if (el.points.length <= 2) return el;
        let bestIdx = 0;
        let bestDist = Infinity;
        el.points.forEach((pt, i) => {
          const d = Math.hypot(p.x - pt.x, p.y - pt.y);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        });
        return { ...el, points: el.points.filter((_, i) => i !== bestIdx) };
      }),
    }));
  }, [applyState, selectedId]);

  const onRotateHandlePointerDown = (e: React.PointerEvent<SVGElement>, el: DrillElement) => {
    if (el.kind !== 'player') return;
    e.stopPropagation();
    undoStack.current.push(cloneState(state));
    dragRef.current = { id: el.id, mode: 'rotate', cx: el.x, cy: el.y };
    (e.currentTarget as SVGElement).setPointerCapture?.(e.pointerId);
  };

  const onResizeHandlePointerDown = (
    e: React.PointerEvent<SVGRectElement>,
    el: DrillElement,
    edge: 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    if (el.kind !== 'area') return;
    e.stopPropagation();
    undoStack.current.push(cloneState(state));
    // Compute the opposite anchor point — the one that stays fixed during the resize.
    const left = el.x - el.width / 2;
    const right = el.x + el.width / 2;
    const top = el.y - el.height / 2;
    const bottom = el.y + el.height / 2;
    const anchorX = edge.includes('e') ? left : edge.includes('w') ? right : el.x;
    const anchorY = edge.includes('s') ? top : edge.includes('n') ? bottom : el.y;
    dragRef.current = { id: el.id, mode: 'resize', edge, anchorX, anchorY };
    (e.currentTarget as SVGRectElement).setPointerCapture?.(e.pointerId);
  };

  /* ---------------- Keyboard shortcuts ---------------- */

  useEffect(() => {
    const isEditable = (t: EventTarget | null): boolean => {
      const el = t as HTMLElement | null;
      if (!el) return false;
      return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable === true;
    };

    const handler = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;
      const sel = state.elements.find((el) => el.id === selectedId);
      const isArrowSelected = sel?.kind === 'arrow';

      if (e.key === 'Escape') {
        setArrowInProgress(null);
        setSelectedId(null);
        setTool('select');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) deleteElement(selectedId);
      } else if (e.key === 'Enter') {
        if (arrowInProgress) finishArrow();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.key === ' ' || e.code === 'Space') {
        // Add a new editable point to the selected line at the cursor.
        if (isArrowSelected) {
          e.preventDefault();
          insertPointAtPointer();
        }
      } else if (e.key === '-' || e.key === '_') {
        // Remove the closest point from the selected line.
        if (isArrowSelected) {
          e.preventDefault();
          removePointAtPointer();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    selectedId,
    deleteElement,
    arrowInProgress,
    finishArrow,
    undo,
    state.elements,
    insertPointAtPointer,
    removePointAtPointer,
  ]);

  /* ---------------- Save/export ---------------- */

  /* Build the SVG string that is persisted.
   *
   * Important: the court itself is NEVER stored — only the user-added
   * elements plus the serialized `EditorState` metadata. The court is always
   * re-rendered dynamically from the active club theme at display time
   * (see `renderDrillGraphicSvg`) so changing the club colours immediately
   * updates every historical graphic without having to re-save anything.
   */
  const buildSvgString = useCallback(
    (embedMetadata: boolean): string => {
      const svgEl = svgRef.current;
      if (!svgEl) return '';
      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      // Editor-only overlays: selection handles, ghost tool preview, temp arrow.
      clone.querySelectorAll('[data-editor-only]').forEach((n) => n.remove());
      // The court is dynamic — strip it so the saved markup only carries the
      // drawing on top. The <defs> block is kept so arrows/markers still work
      // when the SVG is read in isolation (e.g. for download).
      clone.querySelectorAll('[data-court="true"]').forEach((n) => n.remove());
      let inner = clone.innerHTML;
      if (embedMetadata) {
        inner = buildMetadataTag(state) + inner;
      }
      const viewBox = courtViewBox(state.fullCourt);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
    },
    [state]
  );

  const handleSave = useCallback(() => {
    const svg = buildSvgString(true);
    // Re-baseline the dirty snapshot eagerly so a quick onClose triggered
    // right after save (the parent typically dismisses the dialog when the
    // mutation resolves) doesn't trip the unsaved-changes guard.
    initialStateSignatureRef.current = JSON.stringify(state);
    onDirtyChange?.(false);
    void onSave({ svg, state });
  }, [buildSvgString, onSave, state, onDirtyChange]);

  const handleDownload = useCallback(() => {
    /* The downloaded SVG should be self-contained (court included) so it can
     * be opened in any viewer without needing the current club theme. */
    const svg = renderDrillGraphicSvg({ state, theme: effectiveTheme });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drill-graphic-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [state, effectiveTheme]);

  const handleToggleCourt = () => applyState((prev) => ({ ...prev, fullCourt: !prev.fullCourt }));

  const handleChangeTeamColor = useCallback(
    (team: 'offense' | 'defense', newColor: string) => {
      applyState((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.kind === 'player' && el.team === team ? { ...el, color: newColor } : el
        ),
      }));
    },
    [applyState]
  );

  /* ---------------- Rendering ---------------- */

  const selectedElement = useMemo(
    () => state.elements.find((e) => e.id === selectedId) ?? null,
    [state.elements, selectedId]
  );

  const viewBox = courtViewBox(state.fullCourt);

  return (
    <Box
      ref={wrapperRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.default',
      }}
    >
      {/* Top bar */}
      <Paper
        square
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton onClick={onClose}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }} noWrap>
          {title || t('drill.graphics.edit')}
        </Typography>
        <Tooltip title={t('drillEditor.undo')}>
          <span>
            <IconButton onClick={undo} disabled={undoStack.current.length === 0}>
              <UndoIconSvg />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('drillEditor.zoomOut')}>
          <span>
            <IconButton onClick={zoomOut} disabled={zoom <= ZOOM_MIN + 0.001}>
              <ZoomOutIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('drillEditor.zoomReset')}>
          <Button
            variant="text"
            onClick={zoomReset}
            startIcon={<CenterFocusStrongIcon fontSize="small" />}
            sx={{ minWidth: 72, color: 'text.secondary' }}
          >
            {Math.round(zoom * 100)}%
          </Button>
        </Tooltip>
        <Tooltip title={t('drillEditor.zoomIn')}>
          <span>
            <IconButton onClick={zoomIn} disabled={zoom >= ZOOM_MAX - 0.001}>
              <ZoomInIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('drillEditor.toggleCourt')}>
          <IconButton onClick={handleToggleCourt}>
            <HalfCourtIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('drillEditor.menu')}>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MenuIconSvg />
          </IconButton>
        </Tooltip>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
          {t('actions.save')}
        </Button>
      </Paper>

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            handleDownload();
            setMenuAnchor(null);
          }}
        >
          <Box sx={{ mr: 1, display: 'flex' }}>
            <DownloadIconSvg />
          </Box>
          {t('drillEditor.downloadSvg')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setThemeOpen(true);
            setMenuAnchor(null);
          }}
        >
          <Box sx={{ mr: 1, display: 'flex' }}>
            <PaletteIconSvg fill="#6b7280" />
          </Box>
          {t('drillEditor.courtTheme')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const newColor = prompt(t('drillEditor.newOffenseColor'), toolColors.offense);
            if (newColor) {
              setToolColors((prev) => ({ ...prev, offense: newColor }));
              handleChangeTeamColor('offense', newColor);
              commitUsedColor(newColor);
            }
            setMenuAnchor(null);
          }}
        >
          <Box sx={{ mr: 1, display: 'flex' }}>
            <PaletteIconSvg fill={toolColors.offense} />
          </Box>
          {t('drillEditor.changeOffenseColor')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const newColor = prompt(t('drillEditor.newDefenseColor'), toolColors.defense);
            if (newColor) {
              setToolColors((prev) => ({ ...prev, defense: newColor }));
              handleChangeTeamColor('defense', newColor);
              commitUsedColor(newColor);
            }
            setMenuAnchor(null);
          }}
        >
          <Box sx={{ mr: 1, display: 'flex' }}>
            <PaletteIconSvg fill={toolColors.defense} />
          </Box>
          {t('drillEditor.changeDefenseColor')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const newColor = prompt(t('drillEditor.newLineColor'), toolColors.line);
            if (newColor) {
              setToolColors((prev) => ({ ...prev, line: newColor }));
            }
            setMenuAnchor(null);
          }}
        >
          <Box sx={{ mr: 1, display: 'flex' }}>
            <PaletteIconSvg fill={toolColors.line} />
          </Box>
          {t('drillEditor.changeLineColor')}
        </MenuItem>
      </Menu>

      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Canvas */}
        <Box
          /* Clicks landing in the padded area around the SVG (i.e. outside
           * the court itself) behave like "cancel" — the active tool is
           * reset back to the pointer and any selected element is
           * released. Saves the user from having to hit Esc or manually
           * pick Select. */
          onPointerDown={(e) => {
            if (svgRef.current && svgRef.current.contains(e.target as Node)) {
              return;
            }
            if (tool !== 'select') setTool('select');
            if (selectedId) setSelectedId(null);
          }}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            overflow: 'auto',
            bgcolor: '#eceff1',
          }}
        >
          <Box
            sx={{
              /* The base size of the SVG scales with the current zoom so the
               * container itself grows — this lets the outer scroll area
               * handle overflow when the user zooms beyond 100%. */
              width: (state.fullCourt ? 340 : 460) * zoom,
              maxWidth: (state.fullCourt ? 340 : 460) * zoom,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              ref={svgRef}
              viewBox={viewBox}
              style={{
                width: '100%',
                height: 'auto',
                background: '#ffffff',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                borderRadius: 6,
                touchAction: 'none',
                cursor:
                  tool === 'select' ? 'default' : tool === 'eraser' ? 'not-allowed' : 'crosshair',
              }}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={() => setHoverPoint(null)}
              onDoubleClick={handleCanvasDoubleClick}
            >
              <defs>
                <EditorDefs />
              </defs>
              <FibaCourt full={state.fullCourt} theme={effectiveTheme} />
              {/* Grouped rendering (area → shooting → arrow → cone → handoff → player/coach → ball → text) */}
              {RENDER_ORDER.map((kind) => {
                const items = state.elements.filter((e) => e.kind === kind);
                if (items.length === 0) return null;
                return (
                  <g key={kind} className={GROUP_CLASS[kind]}>
                    {items.map((el) => (
                      <g
                        key={el.id}
                        onPointerDown={(e) => onElementPointerDown(e, el)}
                        style={{ cursor: tool === 'eraser' ? 'not-allowed' : 'move' }}
                      >
                        <DrillElementShape element={el} fullCourt={state.fullCourt} />
                      </g>
                    ))}
                  </g>
                );
              })}
              {/* Selection overlay: bounding box + red handles.
               * Area shapes get 8 resize handles (4 corners + 4 edge midpoints).
               * Arrows show a draggable red dot on every path point.
               * Other elements show a single red dot at their centre. */}
              {selectedElement &&
                (() => {
                  const bbox = elementBBox(selectedElement);
                  if (!bbox) return null;
                  const isArea = selectedElement.kind === 'area';
                  const isArrow = selectedElement.kind === 'arrow';
                  const hx = bbox.cx - bbox.w / 2;
                  const hy = bbox.cy - bbox.h / 2;
                  const hs = 24;
                  const handles: Array<{
                    x: number;
                    y: number;
                    edge: 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';
                    cursor: string;
                  }> = isArea
                    ? [
                        { x: hx - hs / 2, y: hy - hs / 2, edge: 'nw', cursor: 'nwse-resize' },
                        {
                          x: hx + bbox.w / 2 - hs / 2,
                          y: hy - hs / 2,
                          edge: 'n',
                          cursor: 'ns-resize',
                        },
                        {
                          x: hx + bbox.w - hs / 2,
                          y: hy - hs / 2,
                          edge: 'ne',
                          cursor: 'nesw-resize',
                        },
                        {
                          x: hx - hs / 2,
                          y: hy + bbox.h / 2 - hs / 2,
                          edge: 'w',
                          cursor: 'ew-resize',
                        },
                        {
                          x: hx + bbox.w - hs / 2,
                          y: hy + bbox.h / 2 - hs / 2,
                          edge: 'e',
                          cursor: 'ew-resize',
                        },
                        {
                          x: hx - hs / 2,
                          y: hy + bbox.h - hs / 2,
                          edge: 'sw',
                          cursor: 'nesw-resize',
                        },
                        {
                          x: hx + bbox.w / 2 - hs / 2,
                          y: hy + bbox.h - hs / 2,
                          edge: 's',
                          cursor: 'ns-resize',
                        },
                        {
                          x: hx + bbox.w - hs / 2,
                          y: hy + bbox.h - hs / 2,
                          edge: 'se',
                          cursor: 'nwse-resize',
                        },
                      ]
                    : [];
                  return (
                    <g data-editor-only>
                      <rect
                        x={hx}
                        y={hy}
                        width={bbox.w}
                        height={bbox.h}
                        fill="rgba(33,150,243,0.06)"
                        stroke="#2196f3"
                        strokeDasharray="10 6"
                        strokeWidth="2"
                        rx="6"
                        pointerEvents="none"
                      />
                      {isArrow &&
                        selectedElement.points.map((pt, i) => (
                          <circle
                            key={i}
                            cx={pt.x}
                            cy={pt.y}
                            r="12"
                            fill="#e53935"
                            stroke="#ffffff"
                            strokeWidth="3"
                            style={{ cursor: 'move' }}
                            onPointerDown={(ev) =>
                              onArrowPointPointerDown(ev, selectedElement.id, i)
                            }
                          />
                        ))}
                      {!isArea && !isArrow && (
                        <circle
                          cx={(selectedElement as { x: number }).x}
                          cy={(selectedElement as { y: number }).y}
                          r="10"
                          fill="#e53935"
                          stroke="#ffffff"
                          strokeWidth="3"
                          pointerEvents="none"
                        />
                      )}
                      {handles.map((h) => (
                        <rect
                          key={h.edge}
                          x={h.x}
                          y={h.y}
                          width={hs}
                          height={hs}
                          fill="#e53935"
                          stroke="#ffffff"
                          strokeWidth="3"
                          style={{ cursor: h.cursor }}
                          onPointerDown={(ev) =>
                            onResizeHandlePointerDown(ev, selectedElement, h.edge)
                          }
                        />
                      ))}
                      {/* Rotation handle for defenders: a small triangle sitting
                       * above the chevron. Drag it around the player centre to
                       * rotate the whole shape (number stays upright). */}
                      {selectedElement.kind === 'player' &&
                        selectedElement.team === 'defense' &&
                        (() => {
                          const rot = selectedElement.rotation ?? 0;
                          const radius = 120;
                          const rad = (rot * Math.PI) / 180;
                          // At rot=0 the chevron points up → place the handle
                          // directly above the player; rotate CW from there.
                          const hxPos = selectedElement.x + Math.sin(rad) * radius;
                          const hyPos = selectedElement.y - Math.cos(rad) * radius;
                          return (
                            <g
                              transform={`translate(${hxPos} ${hyPos}) rotate(${rot})`}
                              style={{ cursor: 'grab' }}
                              onPointerDown={(ev) => onRotateHandlePointerDown(ev, selectedElement)}
                            >
                              <circle r={18} fill="#ffffff" stroke="#2196f3" strokeWidth={3} />
                              <path
                                d="M 0,-12 L -9,6 L 9,6 Z"
                                fill="#2196f3"
                                stroke="#2196f3"
                                strokeWidth={2}
                              />
                            </g>
                          );
                        })()}
                    </g>
                  );
                })()}
              {arrowInProgress && (
                <g data-editor-only opacity={0.8}>
                  <DrillElementShape element={arrowInProgress} fullCourt={state.fullCourt} />
                </g>
              )}
              {/* FIBA-style cursor preview: a ghost of the element that would
               * be placed at the pointer, wrapped in a soft green outline so
               * the user can see exactly where/what will be dropped. */}
              {(() => {
                if (!hoverPoint) return null;
                if (arrowInProgress) return null;
                if (dragRef.current) return null;
                const preview = buildToolPreview(tool, hoverPoint, {
                  nextOffense,
                  nextDefense,
                  toolColors,
                  areaVariant,
                });
                if (!preview) return null;
                const bbox = elementBBox(preview);
                return (
                  <g data-editor-only pointerEvents="none">
                    <g opacity={0.75}>
                      <DrillElementShape element={preview} fullCourt={state.fullCourt} />
                    </g>
                    {bbox && (
                      <rect
                        x={bbox.cx - bbox.w / 2 - 6}
                        y={bbox.cy - bbox.h / 2 - 6}
                        width={bbox.w + 12}
                        height={bbox.h + 12}
                        rx={12}
                        fill="none"
                        stroke="#2e7d32"
                        strokeWidth={4}
                        strokeDasharray="10 6"
                        opacity={0.9}
                      />
                    )}
                  </g>
                );
              })()}
            </svg>
          </Box>
        </Box>

        {/* Right toolbar */}
        <Paper
          square
          sx={{
            width: 220,
            borderLeft: '1px solid',
            borderColor: 'divider',
            p: 1.25,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            overflow: 'auto',
          }}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            orientation="horizontal"
            value={tool}
            onChange={(_e, v) => v && selectTool(v)}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0.5,
              '& .MuiToggleButton-root': {
                border: 1,
                borderColor: 'divider',
                borderRadius: '4px !important',
                padding: '4px',
                minHeight: 40,
              },
            }}
          >
            <ToggleButton value="select">
              <Tooltip title={t('drillEditor.tools.select')}>
                <span style={{ display: 'flex' }}>
                  <SelectIcon />
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="eraser">
              <Tooltip title={t('drillEditor.tools.eraser')}>
                <span style={{ display: 'flex' }}>
                  <EraserIcon />
                </span>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Offense + defense (FIBA-style compact buttons with < > inside) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
            <PlayerToolButton
              tool="offense"
              current={tool}
              onChange={setTool}
              label={t('drillEditor.tools.offense')}
              icon={<OffenseIcon number={nextOffense} />}
              onPrev={() => setNextOffense((n) => Math.max(1, n - 1))}
              onNext={() => setNextOffense((n) => Math.min(99, n + 1))}
            />
            <PlayerToolButton
              tool="defense"
              current={tool}
              onChange={setTool}
              label={t('drillEditor.tools.defense')}
              icon={<DefenseIcon number={nextDefense} />}
              onPrev={() => setNextDefense((n) => Math.max(1, n - 1))}
              onNext={() => setNextDefense((n) => Math.min(99, n + 1))}
            />
          </Box>

          <ToggleButtonGroup
            exclusive
            size="small"
            orientation="horizontal"
            value={tool}
            onChange={(_e, v) => v && selectTool(v)}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0.5,
              '& .MuiToggleButton-root': {
                border: 1,
                borderColor: 'divider',
                borderRadius: '4px !important',
                padding: '4px',
                minHeight: 40,
              },
            }}
          >
            <ToggleButton value="ball">
              <Tooltip title={t('drillEditor.tools.ball')}>
                <span style={{ display: 'flex' }}>
                  <BallIcon />
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="cone">
              <Tooltip title={t('drillEditor.tools.cone')}>
                <span style={{ display: 'flex' }}>
                  <ConeIcon />
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="coach">
              <Tooltip title={t('drillEditor.tools.coach')}>
                <span style={{ display: 'flex' }}>
                  <CoachIcon />
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="text">
              <Tooltip title={t('drillEditor.tools.text')}>
                <span style={{ display: 'flex' }}>
                  <TextIcon />
                </span>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Area tool with variant arrows */}
          <AreaToolButton
            current={tool}
            onChange={setTool}
            label={t('drillEditor.tools.area')}
            variant={areaVariant}
            onPrev={() =>
              setAreaVariant((v) => {
                const i = AREA_VARIANTS.indexOf(v);
                return AREA_VARIANTS[(i - 1 + AREA_VARIANTS.length) % AREA_VARIANTS.length];
              })
            }
            onNext={() =>
              setAreaVariant((v) => {
                const i = AREA_VARIANTS.indexOf(v);
                return AREA_VARIANTS[(i + 1) % AREA_VARIANTS.length];
              })
            }
          />

          <Divider />

          {/* 7 line-like tools, each as its own toggle button */}
          <ToggleButtonGroup
            exclusive
            size="small"
            orientation="horizontal"
            value={tool}
            onChange={(_e, v) => v && selectTool(v)}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0.5,
              '& .MuiToggleButton-root': {
                border: 1,
                borderColor: 'divider',
                borderRadius: '4px !important',
                padding: '4px',
                minHeight: 40,
              },
            }}
          >
            <ToggleButton value="movement">
              <Tooltip title={t('drillEditor.tools.movement')}>
                <span style={{ display: 'flex' }}>
                  <LineMovementIcon />
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="passing">
              <Tooltip title={t('drillEditor.tools.passing')}>
                <span style={{ display: 'flex' }}>
                  <LinePassingIcon />
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="dribbling">
              <Tooltip title={t('drillEditor.tools.dribbling')}>
                <span style={{ display: 'flex' }}>
                  <LineDribblingIcon />
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="screen">
              <Tooltip title={t('drillEditor.tools.screen')}>
                <span style={{ display: 'flex' }}>
                  <LineScreenIcon />
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="line">
              <Tooltip title={t('drillEditor.tools.line')}>
                <span style={{ display: 'flex' }}>
                  <LinePlainIcon />
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="shooting">
              <Tooltip title={t('drillEditor.tools.shooting')}>
                <span style={{ display: 'flex' }}>
                  <ShootingIcon />
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="handoff" sx={{ gridColumn: '1 / -1' }}>
              <Tooltip title={t('drillEditor.tools.handoff')}>
                <span style={{ display: 'flex' }}>
                  <HandoffIcon />
                </span>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider />

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ flex: 1 }}>
              {t('drillEditor.color')}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => setColorAnchor(e.currentTarget)}
              sx={{
                border: '2px solid',
                borderColor: 'divider',
                bgcolor: activeColor,
                width: 28,
                height: 28,
                '&:hover': { bgcolor: activeColor, opacity: 0.9 },
              }}
            />
          </Stack>

          {arrowInProgress && (
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={finishArrow}
            >
              {t('drillEditor.finishArrow')}
            </Button>
          )}

          {selectedElement && (
            <Paper variant="outlined" sx={{ p: 1.25, mt: 1 }}>
              <Typography variant="overline" sx={{ display: 'block', mb: 0.5 }}>
                {t('drillEditor.selection')}
              </Typography>
              <SelectionEditor
                element={selectedElement}
                onChange={(patch) => updateSelected((el) => ({ ...el, ...patch }) as DrillElement)}
              />
              <Button
                fullWidth
                size="small"
                color="error"
                variant="outlined"
                sx={{ mt: 1 }}
                startIcon={<DeleteIcon />}
                onClick={() => deleteElement(selectedElement.id)}
              >
                {t('actions.delete')}
              </Button>
            </Paper>
          )}

          {/* Object list */}
          <Paper variant="outlined" sx={{ mt: 1, overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                py: 0.5,
                bgcolor: 'grey.100',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="overline">{t('drillEditor.objects')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {state.elements.length}
              </Typography>
            </Box>
            <Box sx={{ maxHeight: 180, overflow: 'auto' }}>
              {state.elements.length === 0 ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', p: 1, fontStyle: 'italic' }}
                >
                  {t('drillEditor.noObjects')}
                </Typography>
              ) : (
                state.elements.map((el) => (
                  <Box
                    key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      fontSize: 12,
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: selectedId === el.id ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {elementLabel(el, t)}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(el.id);
                      }}
                      sx={{ p: 0.25 }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Paper>
      </Box>

      {/* Color palette popover — basic presets + recent custom colours
       * + a native colour input for arbitrary picks. */}
      <Popover
        open={!!colorAnchor}
        anchorEl={colorAnchor}
        onClose={() => setColorAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box sx={{ p: 1.5, width: 260 }}>
          <Typography
            variant="overline"
            sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}
          >
            {t('drillEditor.basicColors')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 0.75,
              mb: 1.5,
            }}
          >
            {BASIC_COLORS.map((c) => (
              <ColorSwatch
                key={c}
                color={c}
                selected={activeColor.toLowerCase() === c.toLowerCase()}
                onClick={() => pickColor(c)}
              />
            ))}
          </Box>

          {recentColors.length > 0 &&
            (() => {
              /* Pinned entries come first and stay forever; temporary ones
               * render afterwards in FIFO order. Each swatch gets a tiny
               * pin toggle and an X remove button so the user can curate
               * the palette without ever opening a settings dialog. */
              const sorted = [...recentColors].sort((a, b) => Number(b.pinned) - Number(a.pinned));
              return (
                <>
                  <Typography
                    variant="overline"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      mb: 0.5,
                    }}
                  >
                    {t('drillEditor.recentColors')}
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: 0.75,
                      mb: 1.5,
                    }}
                  >
                    {sorted.map((r) => (
                      <RecentColorSwatch
                        key={r.color}
                        color={r.color}
                        pinned={r.pinned}
                        selected={isSameColor(activeColor, r.color)}
                        onSelect={() => pickColor(r.color)}
                        onTogglePin={() => toggleRecentPinned(r.color)}
                        onRemove={() => removeRecentColor(r.color)}
                        pinLabel={t(r.pinned ? 'drillEditor.unpinColor' : 'drillEditor.pinColor')}
                        removeLabel={t('drillEditor.removeColor')}
                      />
                    ))}
                  </Box>
                </>
              );
            })()}

          <Typography
            variant="overline"
            sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}
          >
            {t('drillEditor.customColor')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              component="input"
              type="color"
              value={activeColor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                pickColor(e.currentTarget.value)
              }
              sx={{
                width: 38,
                height: 38,
                padding: 0,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: 'transparent',
              }}
            />
            <TextField
              size="small"
              value={activeColor}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
                  pickColor(v);
                } else {
                  setToolColors((prev) => ({ ...prev, [activeColorKey]: v }));
                }
              }}
              slotProps={{ htmlInput: { maxLength: 7, style: { fontFamily: 'monospace' } } }}
              sx={{ flex: 1 }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {t('drillEditor.recentColorsHint')}
          </Typography>
        </Box>
      </Popover>

      {/* Court theme is managed in the club settings page. From here we just
       * offer a quick toggle for the centre logo, and link out to the club
       * page for colour changes. */}
      {themeOpen && (
        <Box
          onClick={() => setThemeOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.4)',
            zIndex: 1400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper onClick={(e) => e.stopPropagation()} sx={{ p: 2, width: 360, maxWidth: '90vw' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('drillEditor.courtTheme')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {t('drillEditor.courtThemeHint')}
            </Typography>
            {club?.image && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <input
                  id="show-logo"
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                />
                <Box component="label" htmlFor="show-logo" sx={{ fontSize: 14, cursor: 'pointer' }}>
                  {t('drillEditor.clubLogoCenter')}
                </Box>
              </Stack>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
              {selectedClubId && (
                <Button size="small" variant="outlined" href="/utilities/club" target="_blank">
                  {t('drillEditor.goToClubSettings')}
                </Button>
              )}
              <Button size="small" variant="contained" onClick={() => setThemeOpen(false)}>
                {t('actions.close') || 'Close'}
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

/* ---------------- Small helpers ---------------- */

/** Single colour swatch used throughout the colour picker popover. */
function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        bgcolor: color,
        border: selected ? '3px solid' : '2px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        boxShadow: color.toLowerCase() === '#ffffff' ? 'inset 0 0 0 1px #ccc' : 'none',
        cursor: 'pointer',
        transition: 'transform 80ms ease',
        '&:hover': { transform: 'scale(1.1)' },
      }}
    />
  );
}

/** Recent/pinned colour swatch with inline pin + remove controls. Hovering
 * the swatch reveals the two tiny buttons; clicking the body still selects
 * the colour. */
function RecentColorSwatch({
  color,
  pinned,
  selected,
  onSelect,
  onTogglePin,
  onRemove,
  pinLabel,
  removeLabel,
}: {
  color: string;
  pinned: boolean;
  selected: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onRemove: () => void;
  pinLabel: string;
  removeLabel: string;
}): React.ReactElement {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 32,
        height: 32,
        '&:hover .recent-color-actions': { opacity: 1 },
      }}
    >
      <Box
        onClick={onSelect}
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          bgcolor: color,
          border: selected ? '3px solid' : '2px solid',
          borderColor: selected ? 'primary.main' : 'divider',
          boxShadow: color.toLowerCase() === '#ffffff' ? 'inset 0 0 0 1px #ccc' : 'none',
          cursor: 'pointer',
          transition: 'transform 80ms ease',
          '&:hover': { transform: 'scale(1.1)' },
        }}
      />
      {/* Pin indicator is always visible when the colour is pinned so the
       * user can tell apart fixed from temporary entries at a glance. */}
      {pinned && (
        <Box
          sx={{
            position: 'absolute',
            top: -4,
            left: -4,
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
          }}
        >
          <PushPinIcon sx={{ fontSize: 10 }} />
        </Box>
      )}
      <Box
        className="recent-color-actions"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          opacity: 0,
          transition: 'opacity 120ms ease',
          pointerEvents: 'none',
        }}
      >
        <Tooltip title={pinLabel}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            sx={{
              pointerEvents: 'auto',
              width: 16,
              height: 16,
              p: 0,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
              transform: 'translate(-4px, -4px)',
              color: pinned ? 'primary.main' : 'text.secondary',
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <PushPinIcon sx={{ fontSize: 10 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={removeLabel}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            sx={{
              pointerEvents: 'auto',
              width: 16,
              height: 16,
              p: 0,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
              transform: 'translate(4px, -4px)',
              color: 'text.secondary',
              '&:hover': { bgcolor: 'error.main', color: '#fff' },
            }}
          >
            <CloseIcon sx={{ fontSize: 10 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function PlayerToolButton({
  tool,
  current,
  onChange,
  label,
  icon,
  onPrev,
  onNext,
}: {
  tool: ToolId;
  current: ToolId;
  onChange: (t: ToolId) => void;
  label: string;
  icon: React.ReactElement;
  onPrev: () => void;
  onNext: () => void;
}): React.ReactElement {
  const active = current === tool;
  return (
    <Tooltip title={label}>
      <Box
        onClick={() => onChange(tool)}
        sx={{
          border: 1,
          borderColor: active ? 'primary.main' : 'divider',
          bgcolor: active ? 'action.selected' : 'background.paper',
          borderRadius: 1,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 0.5 }}>
          {icon}
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            width: '100%',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 0.25,
              borderRight: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ChevronLeftIconSvg />
          </Box>
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 0.25,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ChevronRightIconSvg />
          </Box>
        </Box>
      </Box>
    </Tooltip>
  );
}

function AreaToolButton({
  current,
  onChange,
  label,
  variant,
  onPrev,
  onNext,
}: {
  current: ToolId;
  onChange: (t: ToolId) => void;
  label: string;
  variant: AreaVariant;
  onPrev: () => void;
  onNext: () => void;
}): React.ReactElement {
  const active = current === 'area';
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
      <Tooltip title={label}>
        <Box
          onClick={() => onChange('area')}
          sx={{
            gridColumn: '1 / -1',
            border: 1,
            borderColor: active ? 'primary.main' : 'divider',
            bgcolor: active ? 'action.selected' : 'background.paper',
            borderRadius: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 44,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <AreaIcon variant={variant} />
        </Box>
      </Tooltip>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          sx={{ flex: 1, border: 1, borderColor: 'divider', borderRadius: 1, p: 0.25 }}
        >
          <ChevronLeftIconSvg />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          sx={{ flex: 1, border: 1, borderColor: 'divider', borderRadius: 1, p: 0.25 }}
        >
          <ChevronRightIconSvg />
        </IconButton>
      </Box>
    </Box>
  );
}

function SelectionEditor({
  element,
  onChange,
}: {
  element: DrillElement;
  onChange: (patch: Partial<DrillElement>) => void;
}): React.ReactElement {
  const { t } = useTranslation();
  if (element.kind === 'player') {
    return (
      <Stack spacing={1}>
        <TextField
          size="small"
          type="number"
          label={t('drillEditor.number')}
          value={element.number}
          onChange={(e) =>
            onChange({ number: Math.max(0, Number(e.target.value || 0)) } as Partial<DrillElement>)
          }
          slotProps={{ htmlInput: { min: 0, max: 99 } }}
        />
        {element.team === 'defense' && (
          <>
            <TextField
              size="small"
              type="number"
              label={t('drillEditor.rotation')}
              value={element.rotation ?? 0}
              onChange={(e) =>
                onChange({
                  rotation: Number(e.target.value || 0),
                } as Partial<DrillElement>)
              }
              slotProps={{ htmlInput: { step: 15 } }}
            />
            <Typography variant="caption" color="text.secondary">
              {t('drillEditor.rotationHint')}
            </Typography>
          </>
        )}
      </Stack>
    );
  }
  if (element.kind === 'text') {
    return (
      <Stack spacing={1}>
        <TextField
          size="small"
          label={t('drillEditor.textLabel')}
          value={element.text}
          onChange={(e) => onChange({ text: e.target.value } as Partial<DrillElement>)}
          multiline
          minRows={2}
          maxRows={8}
          helperText={t('drillEditor.textMultilineHint')}
        />
        <TextField
          size="small"
          type="number"
          label={t('drillEditor.fontSize')}
          value={element.size}
          onChange={(e) =>
            onChange({ size: Math.max(10, Number(e.target.value || 0)) } as Partial<DrillElement>)
          }
        />
      </Stack>
    );
  }
  if (element.kind === 'arrow') {
    return (
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          {t('drillEditor.arrowVariant')}
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          orientation="vertical"
          fullWidth
          value={element.variant}
          onChange={(_e, v) =>
            v && onChange({ variant: v as ArrowVariant } as Partial<DrillElement>)
          }
          sx={{
            '& .MuiToggleButton-root': { justifyContent: 'flex-start', textTransform: 'none' },
          }}
        >
          {(['movement', 'passing', 'dribbling', 'screen', 'line'] as ArrowVariant[]).map((v) => (
            <ToggleButton key={v} value={v}>
              <LineVariantPreview variant={v} />
              <Box sx={{ ml: 1, fontSize: 12 }}>{t(`drillEditor.variants.${v}`)}</Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary">
          {t('drillEditor.linePointsHint')}
        </Typography>
      </Stack>
    );
  }
  if (element.kind === 'area') {
    return (
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          type="number"
          label={t('drillEditor.width')}
          value={Math.round(element.width)}
          onChange={(e) =>
            onChange({ width: Math.max(30, Number(e.target.value || 0)) } as Partial<DrillElement>)
          }
          slotProps={{ htmlInput: { min: 30, max: 1200 } }}
        />
        <TextField
          size="small"
          type="number"
          label={t('drillEditor.height')}
          value={Math.round(element.height)}
          onChange={(e) =>
            onChange({ height: Math.max(30, Number(e.target.value || 0)) } as Partial<DrillElement>)
          }
          slotProps={{ htmlInput: { min: 30, max: 1200 } }}
        />
      </Stack>
    );
  }
  return <Typography variant="caption">{t('drillEditor.dragToMove')}</Typography>;
}

function elementLabel(el: DrillElement, t: (k: string) => string): string {
  const coord = (x: number, y: number) => ` (${Math.round(x)}, ${Math.round(y)})`;
  switch (el.kind) {
    case 'player':
      return `${el.team === 'offense' ? t('drillEditor.tools.offense') : t('drillEditor.tools.defense')} #${el.number}${coord(el.x, el.y)}`;
    case 'ball':
      return `${t('drillEditor.tools.ball')}${coord(el.x, el.y)}`;
    case 'cone':
      return `${t('drillEditor.tools.cone')}${coord(el.x, el.y)}`;
    case 'coach':
      return `${t('drillEditor.tools.coach')}${coord(el.x, el.y)}`;
    case 'text':
      return `${t('drillEditor.tools.text')}: "${el.text}"${coord(el.x, el.y)}`;
    case 'arrow':
      return `${t(`drillEditor.variants.${el.variant}`)} (${el.points.length} pts)`;
    case 'area':
      return `${t('drillEditor.tools.area')} (${el.variant})${coord(el.x, el.y)}`;
    case 'shooting':
      return `${t('drillEditor.tools.shooting')}${coord(el.x, el.y)}`;
    case 'handoff':
      return `${t('drillEditor.tools.handoff')}${coord(el.x, el.y)}`;
  }
}

function LineVariantPreview({ variant }: { variant: ArrowVariant }): React.ReactElement {
  switch (variant) {
    case 'movement':
      return <LineMovementIcon />;
    case 'passing':
      return <LinePassingIcon />;
    case 'dribbling':
      return <LineDribblingIcon />;
    case 'screen':
      return <LineScreenIcon />;
    case 'line':
    default:
      return <LinePlainIcon />;
  }
}

/* Re-export for convenience */
export { COURT_W, HALF_H, FULL_H };
