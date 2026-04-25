'use client';

import React, { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import Link from 'next/link';

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

import {
  useAddDrillGraphic,
  useDeleteDrillGraphic,
  useReorderDrillGraphics,
  useUpdateDrillGraphic,
} from '@/hooks/useDrills';
import type { DrillGraphicInterface } from '@/types/drills/types';
import DrillGraphicEditor from '@/app/components/drillEditor/DrillGraphicEditor';
import type { CourtTheme } from '@/app/components/drillEditor/FibaCourt';
import { renderDrillGraphicSvg } from '@/app/components/drillEditor/ElementRenderer';
import { parseEditorState, buildMetadataTag } from '@/app/components/drillEditor/serialize';
import type { EditorState } from '@/app/components/drillEditor/types';
import { useClub } from '@/hooks/useClubs';
import { GuardedDialog } from '@/app/components/shared/GuardedDialog';

interface Props {
  drillId: number;
  graphics: DrillGraphicInterface[];
  onMessage?: (msg: string, severity: 'success' | 'error') => void;
}

/**
 * Preview a stored drill graphic.
 *
 * The court is NEVER stored in the database — only the elements (as embedded
 * EditorState metadata). Here we re-render the graphic from scratch using
 * the *current* club theme so historical graphics automatically reflect
 * colour changes made in the club settings.
 *
 * Old records that predate this split (the court was baked into the SVG) are
 * still rendered correctly by falling back to the raw stored markup.
 */
function SvgPreview({
  svg,
  theme,
  fallbackSvg,
}: {
  svg: string;
  theme: CourtTheme;
  fallbackSvg: string;
}): React.ReactElement {
  const html = useMemo(() => {
    const state = parseEditorState(svg);
    if (state) return renderDrillGraphicSvg({ state, theme });
    return svg || fallbackSvg;
  }, [svg, theme, fallbackSvg]);
  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: '3 / 2',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        '& svg': { width: '100%', height: '100%', display: 'block' },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface SortableGraphicProps {
  graphic: DrillGraphicInterface;
  index: number;
  theme: CourtTheme;
  fallbackSvg: string;
  onEdit: (g: DrillGraphicInterface) => void;
  onDelete: (g: DrillGraphicInterface) => void;
}

function SortableGraphic({
  graphic,
  index,
  theme,
  fallbackSvg,
  onEdit,
  onDelete,
}: SortableGraphicProps): React.ReactElement {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: graphic.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{
        p: 1.25,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        border: isDragging ? '2px solid' : '1px solid',
        borderColor: isDragging ? 'primary.main' : 'divider',
      }}
      {...attributes}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <IconButton ref={setActivatorNodeRef} size="small" sx={{ cursor: 'grab' }} {...listeners}>
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {t('drill.graphics.number', { n: index + 1 })}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.25}>
          <Tooltip title={t('drill.graphics.edit')}>
            <IconButton size="small" onClick={() => onEdit(graphic)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('drill.graphics.delete')}>
            <IconButton size="small" color="error" onClick={() => onDelete(graphic)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <SvgPreview svg={graphic.svg} theme={theme} fallbackSvg={fallbackSvg} />
      {graphic.notes && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {graphic.notes}
        </Typography>
      )}
    </Paper>
  );
}

export default function GraphicsPanel({ drillId, graphics, onMessage }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [items, setItems] = useState(graphics);
  React.useEffect(() => setItems(graphics), [graphics]);

  const addGraphic = useAddDrillGraphic(drillId);
  const updateGraphic = useUpdateDrillGraphic(drillId);
  const deleteGraphic = useDeleteDrillGraphic(drillId);
  const reorderGraphics = useReorderDrillGraphics(drillId);

  /* Build the club's current court theme so every preview renders with the
   * up-to-date colours/patterns/logo — historical graphics included. */
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
  /* Fallback preview for empty/new graphics: just the court at default half
   * view themed with the club, no drawings on top. */
  const emptyGraphicSvg = useMemo(() => {
    const emptyState: EditorState = { version: 1, fullCourt: false, elements: [] };
    return renderDrillGraphicSvg({ state: emptyState, theme: courtTheme });
  }, [courtTheme]);
  /* What gets persisted when the user clicks "add graphic": just the
   * serialized empty state — no court markup, since the court is dynamic. */
  const emptyStoredSvg = useMemo(() => {
    const emptyState: EditorState = { version: 1, fullCourt: false, elements: [] };
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0">${buildMetadataTag(emptyState)}</svg>`;
  }, []);

  const [editTarget, setEditTarget] = useState<DrillGraphicInterface | null>(null);
  // The full-screen drill editor reports dirtiness through its onDirtyChange
  // callback so we can route close attempts through the GuardedDialog prompt.
  const [editorDirty, setEditorDirty] = useState(false);
  React.useEffect(() => {
    if (!editTarget) setEditorDirty(false);
  }, [editTarget]);
  const [deleteTarget, setDeleteTarget] = useState<DrillGraphicInterface | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((g) => g.id === active.id);
    const newIndex = items.findIndex((g) => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    try {
      await reorderGraphics.mutateAsync(next.map((g) => g.id));
    } catch (e) {
      setItems(items);
      onMessage?.((e as Error)?.message || t('drill.graphicSave.error'), 'error');
    }
  };

  const handleAdd = async () => {
    try {
      const created = await addGraphic.mutateAsync({ svg: emptyStoredSvg });
      onMessage?.(t('drill.graphicSave.addSuccess'), 'success');
      setEditTarget(created);
    } catch (e) {
      onMessage?.((e as Error)?.message || t('drill.graphicSave.error'), 'error');
    }
  };

  const openEdit = (g: DrillGraphicInterface) => {
    setEditTarget(g);
  };

  const handleSaveEditor = async (payload: { svg: string }) => {
    if (!editTarget) return;
    try {
      await updateGraphic.mutateAsync({
        graphicId: editTarget.id,
        payload: { svg: payload.svg },
      });
      setEditTarget(null);
      onMessage?.(t('drill.graphicSave.success'), 'success');
    } catch (e) {
      onMessage?.((e as Error)?.message || t('drill.graphicSave.error'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGraphic.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      onMessage?.(t('drill.graphicSave.deleteSuccess'), 'success');
    } catch (e) {
      onMessage?.((e as Error)?.message || t('drill.graphicSave.error'), 'error');
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('drill.graphics.title')} ({items.length})
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={addGraphic.isPending}
        >
          {t('drill.graphics.add')}
        </Button>
      </Stack>

      {items.length === 0 ? (
        <Alert severity="info">{t('drill.graphics.empty')}</Alert>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((g) => g.id)} strategy={verticalListSortingStrategy}>
            <Stack spacing={1.5}>
              {items.map((g, i) => (
                <SortableGraphic
                  key={g.id}
                  graphic={g}
                  index={i}
                  theme={courtTheme}
                  fallbackSvg={emptyGraphicSvg}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      )}

      <GuardedDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        isDirty={editorDirty}
        fullScreen
        keepMounted={false}
      >
        {editTarget && (
          <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DrillGraphicEditor
              key={editTarget.id}
              initialSvg={editTarget.svg}
              title={
                t('drill.graphics.edit') +
                ` · #${items.findIndex((g) => g.id === editTarget.id) + 1}`
              }
              saving={updateGraphic.isPending}
              onSave={async (payload) => handleSaveEditor(payload)}
              onClose={() => setEditTarget(null)}
              onDirtyChange={setEditorDirty}
            />
            <Box sx={{ position: 'absolute', top: 8, right: 68 }}>
              <Tooltip title={t('drill.graphics.openFull')}>
                <IconButton
                  component={Link}
                  href={`/utilities/drills/${drillId}/graphics/${editTarget.id}`}
                  size="small"
                >
                  <OpenInFullIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </GuardedDialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('drill.graphics.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('drill.graphics.deleteConfirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>{t('actions.cancel')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteGraphic.isPending}
          >
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
