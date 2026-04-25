'use client';

import React, { ReactElement, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotesIcon from '@mui/icons-material/Notes';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import dayjs from 'dayjs';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type {
  PracticeItemGraphicInterface,
  PracticeItemInterface,
  PracticeItemType,
} from '@/types/practices/types';
import {
  useAddPracticeItem,
  useDeletePracticeItem,
  useReorderPracticeItems,
  useUpdatePracticeItem,
} from '@/hooks/usePractices';
import { useSession } from 'next-auth/react';
import { useClub } from '@/hooks/useClubs';
import { renderDrillGraphicSvg } from '@/app/components/drillEditor/ElementRenderer';
import { parseEditorState } from '@/app/components/drillEditor/serialize';
import type { CourtTheme } from '@/app/components/drillEditor/FibaCourt';
import DrillPickerDialog from './DrillPickerDialog';

interface Props {
  practiceId: number;
  items: PracticeItemInterface[];
  startTime: string; // ISO
  endTime?: string; // ISO — used to show remaining minutes of the session
  onChangedMessage?: (message: string, severity: 'success' | 'error') => void;
}

const typeColor: Record<PracticeItemType, string> = {
  FREETEXT: '#64748b',
  DRILL: '#2563eb',
  PLAY: '#059669',
  BREAKDOWN: '#d97706',
  MY_DRILL: '#7c3aed',
};

type LocalEdit = {
  duration?: string;
  text?: string;
  title?: string;
  /** Per-graphic overrides keyed by drillGraphicId, tracked separately
   * so we can diff them in onBlur. */
  graphicCaptions?: Record<number, string>;
};
type LocalEdits = Record<number, LocalEdit>;

interface SortableItemProps {
  item: PracticeItemInterface;
  startTimeLabel: string;
  edits: LocalEdit;
  courtTheme: CourtTheme;
  onLocalChange: (id: number, field: 'duration' | 'text' | 'title', value: string) => void;
  onGraphicCaptionChange: (itemId: number, drillGraphicId: number, value: string) => void;
  onGraphicFlagChange: (
    item: PracticeItemInterface,
    drillGraphicId: number,
    field: 'printFirst' | 'printOther',
    value: boolean
  ) => void;
  onBlurSave: (item: PracticeItemInterface) => void;
  onDelete: (id: number) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

/** Parse the persisted SVG (which only carries the elements + metadata)
 * and re-render the full graphic on top of the active club court theme.
 * Keeps the practice list visually consistent with the drill editor and
 * automatically picks up theme changes without a re-save. */
function GraphicPreview({
  svg,
  theme,
}: {
  svg: string | null | undefined;
  theme: CourtTheme;
}): ReactElement | null {
  const html = useMemo(() => {
    if (!svg) return null;
    const state = parseEditorState(svg);
    if (state) return renderDrillGraphicSvg({ state, theme });
    return svg;
  }, [svg, theme]);
  if (!html) return null;
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        '& svg': { width: '100%', height: '100%', display: 'block' },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const SortableItem = ({
  item,
  startTimeLabel,
  edits,
  courtTheme,
  onLocalChange,
  onGraphicCaptionChange,
  onGraphicFlagChange,
  onBlurSave,
  onDelete,
  t,
}: SortableItemProps): ReactElement => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const durationValue = edits.duration !== undefined ? edits.duration : String(item.duration ?? 0);
  const textValue = edits.text !== undefined ? edits.text : (item.text ?? '');
  const titleValue = edits.title !== undefined ? edits.title : (item.title ?? '');

  return (
    <Paper
      ref={setNodeRef}
      elevation={isDragging ? 4 : 0}
      style={style}
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: isOver && !isDragging ? 'primary.main' : 'divider',
        borderRadius: 2,
        borderLeft: '4px solid',
        borderLeftColor: typeColor[item.type],
        boxShadow: isOver && !isDragging ? 2 : undefined,
      }}
    >
      <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start' }}>
        <Box
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          sx={{
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'stretch',
            color: 'text.secondary',
            cursor: 'grab',
            touchAction: 'none',
            '&:active': { cursor: 'grabbing' },
            '&:hover': { color: 'text.primary' },
            px: 0.5,
          }}
          aria-label={t('practice.items.dragHint')}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
        <Box
          sx={{
            width: 58,
            pt: 1,
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {startTimeLabel}
        </Box>
        <Box sx={{ width: 64 }}>
          <TextField
            type="number"
            size="small"
            value={durationValue}
            onChange={(e) => onLocalChange(item.id, 'duration', e.target.value)}
            onBlur={() => onBlurSave(item)}
            slotProps={{
              htmlInput: { min: 0, max: 600, style: { textAlign: 'center' } },
            }}
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 0.5 }}>
            <Chip
              size="small"
              label={t(`practice.items.types.${item.type}`)}
              sx={{
                backgroundColor: typeColor[item.type],
                color: 'white',
                fontSize: 11,
                height: 20,
              }}
            />
            <TextField
              size="small"
              variant="standard"
              placeholder={t('practice.items.titlePlaceholder')}
              value={titleValue}
              onChange={(e) => onLocalChange(item.id, 'title', e.target.value)}
              onBlur={() => onBlurSave(item)}
              sx={{ flex: 1 }}
            />
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            placeholder={t('practice.items.detailsPlaceholder')}
            value={textValue}
            onChange={(e) => onLocalChange(item.id, 'text', e.target.value)}
            onBlur={() => onBlurSave(item)}
          />
        </Box>

        {/* Per-graphic previews. Each row shows the drill graphic, a
         * caption field (defaulted from the drill's notes) and the two
         * print-plan flags that control inclusion in the printed plan. */}
        <GraphicsColumn
          item={item}
          captions={edits.graphicCaptions}
          courtTheme={courtTheme}
          onCaptionChange={onGraphicCaptionChange}
          onFlagChange={onGraphicFlagChange}
          onBlurSave={onBlurSave}
          t={t}
        />

        <Tooltip title={t('actions.delete')}>
          <IconButton size="small" color="error" onClick={() => onDelete(item.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

interface GraphicsColumnProps {
  item: PracticeItemInterface;
  captions?: Record<number, string>;
  courtTheme: CourtTheme;
  onCaptionChange: (itemId: number, drillGraphicId: number, value: string) => void;
  onFlagChange: (
    item: PracticeItemInterface,
    drillGraphicId: number,
    field: 'printFirst' | 'printOther',
    value: boolean
  ) => void;
  onBlurSave: (item: PracticeItemInterface) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

const GraphicsColumn = ({
  item,
  captions,
  courtTheme,
  onCaptionChange,
  onFlagChange,
  onBlurSave,
  t,
}: GraphicsColumnProps): ReactElement => {
  const graphics = item.graphics ?? [];

  if (graphics.length === 0) {
    return (
      <Box
        sx={{
          width: 220,
          minHeight: 80,
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: 'background.default',
        }}
      >
        {item.drill?.svg ? (
          <GraphicPreview svg={item.drill.svg} theme={courtTheme} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Stack sx={{ width: 440, gap: 1 }}>
      {graphics.map((g) => (
        <GraphicRow
          key={g.drillGraphicId}
          item={item}
          graphic={g}
          caption={
            captions?.[g.drillGraphicId] !== undefined ? captions[g.drillGraphicId] : g.caption
          }
          courtTheme={courtTheme}
          onCaptionChange={onCaptionChange}
          onFlagChange={onFlagChange}
          onBlurSave={onBlurSave}
          t={t}
        />
      ))}
    </Stack>
  );
};

interface GraphicRowProps {
  item: PracticeItemInterface;
  graphic: PracticeItemGraphicInterface;
  caption: string;
  courtTheme: CourtTheme;
  onCaptionChange: (itemId: number, drillGraphicId: number, value: string) => void;
  onFlagChange: (
    item: PracticeItemInterface,
    drillGraphicId: number,
    field: 'printFirst' | 'printOther',
    value: boolean
  ) => void;
  onBlurSave: (item: PracticeItemInterface) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

const GraphicRow = ({
  item,
  graphic,
  caption,
  courtTheme,
  onCaptionChange,
  onFlagChange,
  onBlurSave,
  t,
}: GraphicRowProps): ReactElement => (
  <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start' }}>
    <Box
      sx={{
        width: 110,
        height: 80,
        flexShrink: 0,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      {graphic.svg ? (
        <GraphicPreview svg={graphic.svg} theme={courtTheme} />
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        </Box>
      )}
    </Box>

    <Stack sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
      <TextField
        size="small"
        multiline
        minRows={1}
        maxRows={3}
        placeholder={t('practice.items.graphicCaptionPlaceholder')}
        value={caption}
        onChange={(e) => onCaptionChange(item.id, graphic.drillGraphicId, e.target.value)}
        onBlur={() => onBlurSave(item)}
      />
      <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={graphic.printFirst}
              onChange={(e) =>
                onFlagChange(item, graphic.drillGraphicId, 'printFirst', e.target.checked)
              }
            />
          }
          label={<Typography variant="caption">{t('practice.items.printFirstPage')}</Typography>}
          sx={{ m: 0 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={graphic.printOther}
              onChange={(e) =>
                onFlagChange(item, graphic.drillGraphicId, 'printOther', e.target.checked)
              }
            />
          }
          label={<Typography variant="caption">{t('practice.items.printOtherPages')}</Typography>}
          sx={{ m: 0 }}
        />
      </Stack>
    </Stack>
  </Stack>
);

const PracticeItemsList = ({
  practiceId,
  items,
  startTime,
  endTime,
  onChangedMessage,
}: Props): ReactElement => {
  const { t } = useTranslation();

  const addItem = useAddPracticeItem(practiceId);
  const updateItem = useUpdatePracticeItem(practiceId);
  const deleteItem = useDeletePracticeItem(practiceId);
  const reorderItems = useReorderPracticeItems(practiceId);

  /* Hydrate the court theme of the active club so previews are rendered
   * with the same colours / pattern / logo the coach configured. */
  const { data: session } = useSession();
  const selectedClubId = session?.user?.selectedClubId ?? null;
  const { data: club } = useClub(selectedClubId);
  const courtTheme: CourtTheme = useMemo(
    () => ({
      background: club?.courtBackground ?? null,
      keyFill: club?.courtKeyColor ?? null,
      centerFill: club?.courtCenterColor ?? null,
      lineColor: club?.courtLineColor ?? null,
      marginColor: club?.courtMarginColor ?? null,
      centerLogoUrl: club?.courtShowLogo !== false ? (club?.image ?? null) : null,
      centerLogoRotation: club?.courtLogoRotation ?? 90,
    }),
    [
      club?.courtBackground,
      club?.courtKeyColor,
      club?.courtCenterColor,
      club?.courtLineColor,
      club?.courtMarginColor,
      club?.courtShowLogo,
      club?.image,
      club?.courtLogoRotation,
    ]
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [localEdits, setLocalEdits] = useState<LocalEdits>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sorted = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  const totalDuration = useMemo(
    () => sorted.reduce((acc, it) => acc + (it.duration || 0), 0),
    [sorted]
  );

  /* Total minutes booked for the session (endTime − startTime). Remaining
   * is what's left for the coach to plan — negative values mean the items
   * already overflow the session window. */
  const plannedDuration = useMemo(() => {
    if (!endTime) return null;
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    const minutes = end.diff(start, 'minute');
    return Number.isFinite(minutes) && minutes > 0 ? minutes : null;
  }, [startTime, endTime]);

  const remainingDuration = plannedDuration != null ? plannedDuration - totalDuration : null;

  const startTimes = useMemo(() => {
    const base = dayjs(startTime);
    const result: Record<number, string> = {};
    let minutesSoFar = 0;
    for (const it of sorted) {
      result[it.id] = base.add(minutesSoFar, 'minute').format('HH:mm');
      minutesSoFar += it.duration || 0;
    }
    return result;
  }, [sorted, startTime]);

  const handleAddFreeText = async (): Promise<void> => {
    try {
      await addItem.mutateAsync({
        type: 'FREETEXT',
        duration: 10,
        text: '',
        title: null,
      });
      onChangedMessage?.(t('practice.items.addSuccess'), 'success');
    } catch (e) {
      onChangedMessage?.((e as Error)?.message || t('practice.items.addError'), 'error');
    }
  };

  const handlePickDrill = async (drill: {
    id: number;
    title?: string | null;
    name?: string | null;
  }): Promise<void> => {
    setPickerOpen(false);
    try {
      await addItem.mutateAsync({
        type: 'MY_DRILL',
        duration: 10,
        drillId: drill.id,
        title: drill.title || drill.name || `#${drill.id}`,
        text: null,
      });
      onChangedMessage?.(t('practice.items.addSuccess'), 'success');
    } catch (e) {
      onChangedMessage?.((e as Error)?.message || t('practice.items.addError'), 'error');
    }
  };

  const handleLocalChange = (
    id: number,
    field: 'duration' | 'text' | 'title',
    value: string
  ): void => {
    setLocalEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleGraphicCaptionChange = (
    itemId: number,
    drillGraphicId: number,
    value: string
  ): void => {
    setLocalEdits((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        graphicCaptions: {
          ...(prev[itemId]?.graphicCaptions ?? {}),
          [drillGraphicId]: value,
        },
      },
    }));
  };

  /** Persist a checkbox change immediately — the coach doesn't expect to
   * blur a checkbox to save. */
  const handleGraphicFlagChange = async (
    item: PracticeItemInterface,
    drillGraphicId: number,
    field: 'printFirst' | 'printOther',
    value: boolean
  ): Promise<void> => {
    const currentCaptions = localEdits[item.id]?.graphicCaptions ?? {};
    const nextGraphics = (item.graphics ?? []).map((g) =>
      g.drillGraphicId === drillGraphicId
        ? {
            drillGraphicId: g.drillGraphicId,
            caption:
              currentCaptions[g.drillGraphicId] !== undefined
                ? currentCaptions[g.drillGraphicId]
                : g.caption,
            printFirst: field === 'printFirst' ? value : g.printFirst,
            printOther: field === 'printOther' ? value : g.printOther,
          }
        : {
            drillGraphicId: g.drillGraphicId,
            caption:
              currentCaptions[g.drillGraphicId] !== undefined
                ? currentCaptions[g.drillGraphicId]
                : g.caption,
            printFirst: g.printFirst,
            printOther: g.printOther,
          }
    );
    try {
      await updateItem.mutateAsync({
        itemId: item.id,
        payload: { graphics: nextGraphics },
      });
      setLocalEdits((prev) => {
        const { [item.id]: _removed, ...rest } = prev;
        return rest;
      });
    } catch (e) {
      onChangedMessage?.((e as Error)?.message || t('practice.items.saveError'), 'error');
    }
  };

  const handleBlurSave = async (item: PracticeItemInterface): Promise<void> => {
    const edits = localEdits[item.id];
    if (!edits) return;
    const payload: Record<string, unknown> = {};
    if (edits.duration !== undefined) {
      const n = Number(edits.duration);
      if (Number.isFinite(n)) payload.duration = Math.max(0, Math.min(600, Math.round(n)));
    }
    if (edits.text !== undefined) payload.text = edits.text;
    if (edits.title !== undefined) payload.title = edits.title;
    /* When captions have been edited, merge them onto the existing
     * graphics entries (preserving flags) and send the whole array — the
     * API replaces the stored JSON verbatim so we mustn't drop entries. */
    if (edits.graphicCaptions && (item.graphics ?? []).length > 0) {
      payload.graphics = (item.graphics ?? []).map((g) => ({
        drillGraphicId: g.drillGraphicId,
        caption:
          edits.graphicCaptions?.[g.drillGraphicId] !== undefined
            ? edits.graphicCaptions[g.drillGraphicId]
            : g.caption,
        printFirst: g.printFirst,
        printOther: g.printOther,
      }));
    }
    if (Object.keys(payload).length === 0) return;
    try {
      await updateItem.mutateAsync({ itemId: item.id, payload });
      setLocalEdits((prev) => {
        const { [item.id]: _removed, ...rest } = prev;
        return rest;
      });
    } catch (e) {
      onChangedMessage?.((e as Error)?.message || t('practice.items.saveError'), 'error');
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await deleteItem.mutateAsync(id);
      onChangedMessage?.(t('practice.items.deleteSuccess'), 'success');
    } catch (e) {
      onChangedMessage?.((e as Error)?.message || t('practice.items.deleteError'), 'error');
    }
  };

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sorted.map((x) => x.id);
    const oldIndex = ids.indexOf(Number(active.id));
    const newIndex = ids.indexOf(Number(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const nextIds = arrayMove(ids, oldIndex, newIndex);
    try {
      await reorderItems.mutateAsync(nextIds);
    } catch (e) {
      onChangedMessage?.((e as Error)?.message || t('practice.items.reorderError'), 'error');
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
      >
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t('practice.items.title')}
          </Typography>
          <Chip
            size="small"
            icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
            label={`${totalDuration} min`}
            variant="outlined"
          />
          {remainingDuration != null ? (
            <Chip
              size="small"
              color={
                remainingDuration < 0 ? 'error' : remainingDuration === 0 ? 'success' : 'default'
              }
              variant={remainingDuration === 0 ? 'filled' : 'outlined'}
              icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
              label={
                remainingDuration < 0
                  ? t('practice.items.overBy', { minutes: Math.abs(remainingDuration) })
                  : t('practice.items.remaining', { minutes: remainingDuration })
              }
            />
          ) : null}
          <Chip size="small" label={sorted.length} />
        </Stack>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<NotesIcon />}
            onClick={() => void handleAddFreeText()}
          >
            {t('practice.items.addFreetext')}
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<SportsBasketballIcon />}
            onClick={() => setPickerOpen(true)}
          >
            {t('practice.items.addDrill')}
          </Button>
        </Stack>
      </Stack>

      {sorted.length === 0 ? (
        <Alert severity="info">{t('practice.items.empty')}</Alert>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map((x) => x.id)} strategy={verticalListSortingStrategy}>
            <Stack sx={{ gap: 1 }}>
              {sorted.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  startTimeLabel={startTimes[item.id] ?? '--:--'}
                  edits={localEdits[item.id] ?? {}}
                  courtTheme={courtTheme}
                  onLocalChange={handleLocalChange}
                  onGraphicCaptionChange={handleGraphicCaptionChange}
                  onGraphicFlagChange={(it, gid, field, value) =>
                    void handleGraphicFlagChange(it, gid, field, value)
                  }
                  onBlurSave={handleBlurSave}
                  onDelete={handleDelete}
                  t={t}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      )}

      {(addItem.isPending || reorderItems.isPending) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      <DrillPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(d) => void handlePickDrill(d)}
      />
    </Box>
  );
};

export default PracticeItemsList;
