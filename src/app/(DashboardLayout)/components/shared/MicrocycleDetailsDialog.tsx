import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';

// Set the locale to Portuguese
dayjs.locale('pt');

interface Goal {
  order: number;
  duration: number;
  notes: string;
  coach: string;
}

interface DayData {
  day: string;
  weekday: string;
  goals: Goal[];
}

interface CycleDetails {
  name: string;
  startDate: string;
  endDate: string;
}

interface MicrocycleDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  data: DayData[] | null;
  macrocycle?: CycleDetails | null;
  mesocycle?: CycleDetails | null;
}

const MicrocycleDetailsDialog: React.FC<MicrocycleDetailsDialogProps> = ({
  open,
  onClose,
  data,
  macrocycle,
  mesocycle,
}) => {
  if (!data) return null;

  // Find the maximum number of goals in a day for consistent row rendering
  const maxGoals = Math.max(...data.map((day) => day.goals.length));

  // Calculate total duration for each day
  const totals = data.map((day) => {
    const totalMinutes = day.goals.reduce((sum, goal) => sum + goal.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h:${minutes}m`;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Detalhes do Microciclo</DialogTitle>
      <DialogContent>
        {/* Macrocycle and Mesocycle Details */}
        {macrocycle && (
          <Typography variant="h6" gutterBottom>
            <strong>Macrociclo:</strong> {macrocycle.name} (
            {dayjs(macrocycle.startDate).format('DD/MM/YYYY')} -{' '}
            {dayjs(macrocycle.endDate).format('DD/MM/YYYY')})
          </Typography>
        )}
        {mesocycle && (
          <Typography variant="h6" gutterBottom>
            <strong>Mesociclo:</strong> {mesocycle.name} (
            {dayjs(mesocycle.startDate).format('DD/MM/YYYY')} -{' '}
            {dayjs(mesocycle.endDate).format('DD/MM/YYYY')})
          </Typography>
        )}

        {/* Table of Goals */}
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'lightgray', borderBottom: '2px solid black' }}>
              {data.map((day, dayIndex) => (
                <TableCell
                  key={dayIndex}
                  align="left"
                  sx={{ fontWeight: 'bold', borderBottom: '2px solid black' }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {`${day.day} (${dayjs(day.day).format('dddd')})`}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: maxGoals }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {data.map((day, dayIndex) => {
                  const goal = day.goals[rowIndex];
                  return goal ? (
                    <TableCell
                      key={`${dayIndex}-${rowIndex}`}
                      align="left"
                      sx={{
                        borderBottom: '1px solid gray',
                        verticalAlign: 'top',
                        padding: '8px',
                      }}
                    >
                      <Typography>
                        <strong>Duração:</strong> {goal.duration}
                      </Typography>
                      <Typography sx={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>
                        <strong>Notas:</strong> {goal.notes}
                      </Typography>
                      <Typography>
                        <strong>Treinador:</strong> {goal.coach}
                      </Typography>
                    </TableCell>
                  ) : (
                    <TableCell
                      key={`${dayIndex}-${rowIndex}`}
                      sx={{ borderBottom: '1px solid gray' }}
                    />
                  );
                })}
              </TableRow>
            ))}
            {/* Totals Row */}
            <TableRow sx={{ backgroundColor: 'lightgray', borderTop: '2px solid black' }}>
              {totals.map((total, index) => (
                <TableCell key={index} align="left" sx={{ fontWeight: 'bold' }}>
                  <Typography>Total: {total}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default MicrocycleDetailsDialog;
