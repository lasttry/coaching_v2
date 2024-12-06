import React from 'react';
import { Dialog, DialogTitle, DialogContent, Table, TableBody, TableRow, TableCell, Typography, Button } from '@mui/material';

const MicrocycleDetailsDialog = ({ open, onClose, data }) => {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Microcycle Details</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            {/* Render Days */}
            <TableRow>
              <TableCell />
              {data.days.map((day, index) => (
                <TableCell key={index} align="center">
                  <Typography variant="subtitle2">Day {day}</Typography>
                </TableCell>
              ))}
            </TableRow>

            {/* Render Times */}
            {data.sessions.map((session, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell>Time</TableCell>
                  {session.durations.map((duration, idx) => (
                    <TableCell key={idx}>{duration}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Coach</TableCell>
                  {session.notes.map((note, idx) => (
                    <TableCell key={idx}>{note}</TableCell>
                  ))}
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default MicrocycleDetailsDialog;
