'use client';

import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';
import dayjs from 'dayjs';

interface SessionGoal {
  id: string | number;
  date: string;
  duration: number;
  note: string;
  coach: string;
  order: number;
}

interface GroupedDay {
  day: string;
  weekday: string;
  goals: SessionGoal[];
  totalDuration: number;
}

interface SessionGoalsTablesProps {
  data: SessionGoal[];
}

const SessionGoalsTables = ({ data }: SessionGoalsTablesProps): ReactElement => {
  const [groupedData, setGroupedData] = useState<GroupedDay[]>([]);

  // Group and sort data by date
  useEffect(() => {
    if (data.length > 0) {
      const grouped = data.reduce<Record<string, GroupedDay>>((acc, item) => {
        const day = dayjs(item.date).format('YYYY-MM-DD');
        const weekday = dayjs(item.date).format('dddd');

        if (!acc[day]) {
          acc[day] = { day, weekday, goals: [], totalDuration: 0 };
        }

        acc[day].goals.push(item);
        acc[day].totalDuration += item.duration; // Sum durations
        return acc;
      }, {});

      const sortedGroupedData: GroupedDay[] = Object.values(grouped)
        .map((group) => ({
          ...group,
          goals: group.goals.sort((a, b) => a.order - b.order),
        }))
        .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

      setGroupedData(sortedGroupedData);
    }
  }, [data]);

  if (groupedData.length === 0) {
    return <Typography>No data available</Typography>;
  }

  return (
    <Box sx={{ overflowX: 'auto', padding: 2 }}>
      <Table
        sx={{
          border: '1px solid',
          borderCollapse: 'collapse',
          tableLayout: 'auto',
        }}
      >
        <TableHead>
          <TableRow>
            {groupedData.map((day, index) => (
              <TableCell
                key={index}
                sx={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  padding: 2,
                  borderBottom: '2px solid black',
                  borderRight: index < groupedData.length - 1 ? '1px solid black' : 'none',
                }}
              >
                <Typography variant="h6">
                  {day.weekday}, {day.day}
                </Typography>
                <Typography variant="subtitle1">
                  Duração Total: {Math.floor(day.totalDuration / 60)}h {day.totalDuration % 60}m
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {groupedData.map((day, index) => (
              <TableCell
                key={index}
                sx={{
                  verticalAlign: 'top',
                  borderRight: index < groupedData.length - 1 ? '1px solid black' : 'none',
                  padding: 2,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          width: '10px', // Enough for two digits
                          fontWeight: 'bold',
                          textAlign: 'left',
                          borderBottom: '1px solid black',
                        }}
                      ></TableCell>
                      <TableCell
                        sx={{
                          width: 'auto', // Multiline content
                          fontWeight: 'bold',
                          textAlign: 'left',
                          borderBottom: '1px solid black',
                        }}
                      >
                        Notas
                      </TableCell>
                      <TableCell
                        sx={{
                          width: '50px', // Enough for first and last name
                          fontWeight: 'bold',
                          textAlign: 'left',
                          borderBottom: '1px solid black',
                        }}
                      >
                        Treinador
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {day.goals.map((goal) => (
                      <TableRow key={goal.id}>
                        <TableCell
                          sx={{
                            textAlign: 'left',
                            whiteSpace: 'nowrap', // Prevent wrapping
                          }}
                        >
                          {goal.duration}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: 'left',
                            whiteSpace: 'pre-wrap', // Allow multiline content
                          }}
                        >
                          {goal.note}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: 'left',
                          }}
                        >
                          {goal.coach}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
};

export default SessionGoalsTables;
