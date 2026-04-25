'use client';

import React, { ReactElement } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import AttendanceReasonsEditor from '@/app/utilities/practices/components/AttendanceReasonsEditor';

interface Props {
  /** When false the editor is read-only (non-admin users). */
  canManage: boolean;
  expanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

/** Accordion section inside the Club settings page that hosts the list
 * of club-scoped absence reasons. Kept separate from the practice-plan
 * dialog so coaches find all club-wide configuration in the same
 * place. */
export default function ClubAttendanceReasons({
  canManage,
  expanded,
  onExpandedChange,
}: Props): ReactElement {
  const { t } = useTranslation();

  return (
    <Accordion expanded={expanded} onChange={(_e, v) => onExpandedChange?.(v)} sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flex: 1 }}>
          <EventBusyIcon />
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {t('practice.attendance.settings.title')}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <AttendanceReasonsEditor canManage={canManage} hideHeader />
      </AccordionDetails>
    </Accordion>
  );
}
