import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import SessionGoalsTables from './SessionGoalsTables';
import { MesocycleInterface, MacrocycleInterface, SessionGoalInterface } from '@/types/cycles/types';

// Set the locale to Portuguese
dayjs.locale('pt');

interface MicrocycleDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  data: SessionGoalInterface[] | null;
  macrocycle?: MacrocycleInterface | null;
  mesocycle?: MesocycleInterface | null;
}

const MicrocycleDetailsDialog: React.FC<MicrocycleDetailsDialogProps> = ({ open, onClose, data, macrocycle, mesocycle }) => {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Detalhes do Microciclo</DialogTitle>
      <DialogContent>
        {/* Macrocycle and Mesocycle Details */}
        {macrocycle && (
          <Typography variant="h6" gutterBottom>
            <strong>Macrociclo:</strong> {macrocycle.name} ({dayjs(macrocycle.startDate).format('DD/MM/YYYY')} -{' '}
            {dayjs(macrocycle.endDate).format('DD/MM/YYYY')})
          </Typography>
        )}
        {mesocycle && (
          <Typography variant="h6" gutterBottom>
            <strong>Mesociclo:</strong> {mesocycle.name} ({dayjs(mesocycle.startDate).format('DD/MM/YYYY')} - {dayjs(mesocycle.endDate).format('DD/MM/YYYY')})
          </Typography>
        )}
        <SessionGoalsTables data={data} />
      </DialogContent>
    </Dialog>
  );
};

export default MicrocycleDetailsDialog;
