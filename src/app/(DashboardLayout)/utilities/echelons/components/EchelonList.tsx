'use client';

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { EchelonInterface } from '@/types/echelons/types';

interface EchelonListProps {
  echelons: Record<string, EchelonInterface[]>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
  refreshEchelons: () => void;
}

const EchelonListComponent: React.FC<EchelonListProps> = ({ echelons, setErrorMessage, setSuccessMessage, refreshEchelons }) => {
  const { t } = useTranslation();

  const handleDelete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/echelons/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(t('deleteError'));

      setSuccessMessage(t('deleteSuccess'));
      refreshEchelons();
    } catch (error) {
      setErrorMessage(`${t('deleteError')}: ${error}`);
    }
  };

  return (
    <TableContainer component={Paper} sx={{ marginTop: 4 }}>
      {Object.entries(echelons).map(([gender, echelonList]) => (
        <Accordion key={gender} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{t(gender)}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('name')}</TableCell>
                  <TableCell>{t('minAge')}</TableCell>
                  <TableCell>{t('maxAge')}</TableCell>
                  <TableCell>{t('gender')}</TableCell>
                  <TableCell>{t('description')}</TableCell>
                  <TableCell>{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {echelonList.map((echelon) => (
                  <TableRow key={echelon.id}>
                    <TableCell>{echelon.name}</TableCell>
                    <TableCell>{echelon.minAge}</TableCell>
                    <TableCell>{echelon.maxAge}</TableCell>
                    <TableCell>{t(echelon.gender || 'Unknown')}</TableCell>
                    <TableCell>{echelon.description}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="error" onClick={() => handleDelete(echelon.id!)}>
                        {t('Delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}
    </TableContainer>
  );
};

EchelonListComponent.displayName = 'EchelonListComponent';
export default EchelonListComponent;
