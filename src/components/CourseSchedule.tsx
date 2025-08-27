// import React, { useEffect, useState } from 'react';
// import {
//   Typography,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
//   Box,
//   CircularProgress
// } from '@mui/material';
// import { useOutletContext } from 'react-router-dom';
// import { getCourseSchedule } from '../services/authService';

// interface OutletContextType {
//   selectedTerm: string;
// }

// const daysOrder = [
//   'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'
// ];

// const CourseSchedulePage: React.FC = () => {
//   const { selectedTerm } = useOutletContext<OutletContextType>();
//   const [schedule, setSchedule] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Eğer dönem seçili değilse, veri çekme
//     if (!selectedTerm) {
//       setSchedule([]);
//       setLoading(false);
//       return;
//     }
//     const fetchSchedule = async () => {
//       try {
//         const result = await getCourseSchedule(selectedTerm);
//         setSchedule(result);
//       } catch (error) {
//         console.error('Program alınamadı:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSchedule();
//   }, [selectedTerm]);

//   const grouped = daysOrder.map((day) => ({
//     day,
//     items: schedule
//       .filter((s) => s.weekday === day)
//       .sort((a, b) => a.start_time.localeCompare(b.start_time)),
//   }));

//   return (
//     <Box p={3}>
//       <Typography variant="h5" mb={2} className='headerStyles'>
//         Ders Programım - {selectedTerm ? selectedTerm : 'Dönem Seçilmemiş'}
//       </Typography>
//       {loading ? (
//         <CircularProgress />
//       ) : selectedTerm === '' ? (
//         <Typography>Lütfen üst menüden bir dönem seçin.</Typography>
//       ) : (
//         grouped.map(({ day, items }) => (
//           <Paper key={day} sx={{ mb: 2, p: 2, backgroundColor:'aliceblue' }}>
//             <Typography variant="h6" className='headerStyles'>{day}</Typography>
//             <List>
//               {items.length > 0 ? (
//                 items.map((item) => (
//                   <ListItem key={item.id} divider>
//                     <ListItemText
//                       primary={`${item.course.name} (${item.course.code})`}
//                       secondary={`${item.start_time} - ${item.end_time} | Salon: ${item.room}`}
//                     />
//                   </ListItem>
//                 ))
//               ) : (
//                 <Typography variant="body2" color="text.secondary">
//                   Bu gün ders bulunmamaktadır.
//                 </Typography>
//               )}
//             </List>
//           </Paper>
//         ))
//       )}
//     </Box>
//   );
// };

// export default CourseSchedulePage;

import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { getCourseSchedule } from "../services/authService";

interface OutletContextType {
  selectedTerm: string;
}

const daysOrder = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

const CourseSchedulePage: React.FC = () => {
  const { selectedTerm } = useOutletContext<OutletContextType>();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedTerm) {
      setSchedule([]);
      setLoading(false);
      return;
    }

    const fetchSchedule = async () => {
      try {
        const result = await getCourseSchedule(selectedTerm);
        setSchedule(result);
      } catch (error) {
        console.error("Program alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedTerm]);

  // Saat aralıklarını çıkar
  const timeSlots = Array.from(
    new Set(schedule.map((s) => `${s.start_time} - ${s.end_time}`))
  ).sort();

  // Gün ve saat kombinasyonuna göre map
  const scheduleMap: Record<string, Record<string, any>> = {};
  daysOrder.forEach((day) => {
    scheduleMap[day] = {};
    timeSlots.forEach((slot) => {
      scheduleMap[day][slot] = null;
    });
  });

  schedule.forEach((item) => {
    const slot = `${item.start_time} - ${item.end_time}`;
    scheduleMap[item.weekday][slot] = item;
  });

  return (
    <Box p={3}>
      <Typography
        variant="h5"
        mb={3}
        sx={{
          color: "#0c3e8b",
          fontWeight: 600,
          fontSize: "28px",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Ders Programı - {selectedTerm || "Dönem Seçilmemiş"}
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : selectedTerm === "" ? (
        <Typography>Lütfen üst menüden bir dönem seçin.</Typography>
      ) : (
        <TableContainer component={Paper} className="headerStyles">
          <Table>
            <TableHead className="headerStyles">
              <TableRow>
                <TableCell>
                  <strong className="headerSchedule">Saat</strong>
                </TableCell>
                {daysOrder.map((day) => (
                  <TableCell key={day} align="center">
                    <strong className="headerSchedule">{day}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSlots.map((slot) => (
                <TableRow key={slot}>
                  <TableCell
                    sx={{
                      color: "#0c3e8b",
                      fontWeight: 300,
                      backgroundColor: "rgba(247, 247, 247, 1)",
                    }}
                  >
                    {slot}
                  </TableCell>
                  {daysOrder.map((day) => {
                    const course = scheduleMap[day][slot];
                    return (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{ backgroundColor: "rgba(247, 247, 247, 1)" }}
                      >
                        {course ? (
                          <>
                            <Typography variant="subtitle2">
                              {course.course.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {course.course.code} | Salon: {course.room}
                            </Typography>
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CourseSchedulePage;
