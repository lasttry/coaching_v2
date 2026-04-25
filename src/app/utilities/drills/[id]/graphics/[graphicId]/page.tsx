'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Alert, Box, CircularProgress, Snackbar } from '@mui/material';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

import DrillGraphicEditor from '@/app/components/drillEditor/DrillGraphicEditor';
import { useDrill, useUpdateDrillGraphic } from '@/hooks/useDrills';

export default function DrillGraphicEditorPage(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string; graphicId: string }>();
  const drillId = Number(params?.id);
  const graphicId = Number(params?.graphicId);

  const drillQuery = useDrill(drillId);
  const updateGraphic = useUpdateDrillGraphic(drillId);

  const [snack, setSnack] = React.useState<{
    msg: string;
    severity: 'success' | 'error';
  } | null>(null);

  const graphic = useMemo(
    () => drillQuery.data?.graphics?.find((g) => g.id === graphicId) ?? null,
    [drillQuery.data, graphicId]
  );

  const handleSave = async (payload: { svg: string }) => {
    try {
      await updateGraphic.mutateAsync({
        graphicId,
        payload: { svg: payload.svg },
      });
      setSnack({ msg: t('drill.graphicSave.success'), severity: 'success' });
    } catch (e) {
      setSnack({
        msg: (e as Error)?.message || t('drill.graphicSave.error'),
        severity: 'error',
      });
    }
  };

  if (drillQuery.isLoading) {
    return (
      <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (drillQuery.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{(drillQuery.error as Error).message}</Alert>
      </Box>
    );
  }

  if (!graphic) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">{t('drill.save.notFound')}</Alert>
      </Box>
    );
  }

  const index = (drillQuery.data?.graphics ?? []).findIndex((g) => g.id === graphicId);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DrillGraphicEditor
        initialSvg={graphic.svg}
        title={`${drillQuery.data?.title ?? ''} · ${t('drill.graphics.number', { n: index + 1 })}`}
        saving={updateGraphic.isPending}
        onSave={handleSave}
        onClose={() => router.push(`/utilities/drills/${drillId}`)}
      />
      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snack ? (
          <Alert severity={snack.severity} onClose={() => setSnack(null)}>
            {snack.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
