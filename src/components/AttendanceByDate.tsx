// // AttendanceByDate.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Typography,
//   CircularProgress,
//   Alert,
//   MenuItem,
//   TextField,
//   Card,
//   CardContent,
//   Grid,
// } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';
// import type { GridColDef } from '@mui/x-data-grid';

// import {
//   getStudentsByCourseId,
//   getAttendanceByCourseAndDate,
//   getAllCourses,
//   getAttendanceStatsForStudents,
// } from '../services/authService';

// import { format } from 'date-fns';
// import { tr } from 'date-fns/locale';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { useOutletContext } from 'react-router-dom';

// interface OutletContextType {
//   selectedTerm: string;
// }

// const AttendanceByDate: React.FC = () => {
//   const { selectedTerm } = useOutletContext<OutletContextType>();
//   const [courses, setCourses] = useState<any[]>([]);
//   const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
//   const [students, setStudents] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [dateHasAttendance, setDateHasAttendance] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);

//   const fetchCourses = async () => {
//     if (!selectedTerm) return;
//     try {
//       const allCourses = await getAllCourses();
//       const filtered = allCourses.filter((c: any) => c.term === selectedTerm);
//       setCourses(filtered);
//     } catch {
//       setError('Dersler alınırken hata oluştu.');
//     }
//   };

//   const fetchData = async (dateStr: string | null) => {
//     if (!selectedCourseId) return;

//     try {
//       setLoading(true);
//       setError('');

//       const studentData = await getStudentsByCourseId(selectedCourseId);
//       const attendanceStats = await getAttendanceStatsForStudents(selectedCourseId);

//       let mapped: Record<string, string> = {};
//       if (dateStr) {
//         const attendanceData = await getAttendanceByCourseAndDate(selectedCourseId, dateStr);
//         if (attendanceData.length > 0) {
//           mapped = attendanceData.reduce((acc, record) => {
//             acc[record.student_id] = record.status;
//             return acc;
//           }, {} as Record<string, string>);
//           setDateHasAttendance(true);
//         } else {
//           setDateHasAttendance(false);
//         }
//       }

//       const updated = studentData.map((s) => {
//         const stats = attendanceStats[String(s.id)] || {
//           attended: 0,
//           late: 0,
//           absent: 0,
//         };

//         return {
//           ...s,
//           attended: stats.attended,
//           late: stats.late,
//           absent: stats.absent,
//           status: mapped[s.id] || '',
//         };
//       });

//       setStudents(updated);
//     } catch {
//       setError('Veriler alınırken hata oluştu.');
//       setStudents([]);
//       setDateHasAttendance(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCourses();
//   }, [selectedTerm]);

//   useEffect(() => {
//     const formatted = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
//     if (selectedCourseId) fetchData(formatted);
//   }, [selectedCourseId, selectedDate]);

//   if (!selectedTerm) {
//     return <Box mt={4}><Alert severity="info">Lütfen önce dönem seçiniz.</Alert></Box>;
//   }

//   const total = students.length;
//   const attended = students.filter((s) => s.status === 'Katıldı').length;
//   const late = students.filter((s) => s.status === 'Geç Kaldı').length;
//   const absent = students.filter((s) => s.status === 'Katılmadı').length;

//   const columns: GridColDef[] = [
//     { field: 'name', headerName: 'Ad Soyad', flex: 1 },
//     { field: 'email', headerName: 'E-Posta', flex: 1 },
//     { field: 'number', headerName: 'Öğrenci No', flex: 1 },
//     { field: 'attended', headerName: 'Toplam Katıldı', flex: 1 },
//     { field: 'late', headerName: 'Toplam Geç Kaldı', flex: 1 },
//     { field: 'absent', headerName: 'Toplam Katılmadı', flex: 1 },
//     {
//       field: 'status',
//       headerName: 'Bu Tarih',
//       flex: 1,
//       renderCell: (params) => {
//         if (!selectedDate) return <Typography color="text.secondary">Tarih seçilmedi</Typography>;
//         if (!dateHasAttendance) return <Typography color="text.secondary">Yoklama alınmamış</Typography>;
//         return <Typography>{params.value || '—'}</Typography>;
//       },
//     },
//   ];

//   return (
//     <Box mt={4}>
//       <Typography variant="h6" color="primary" fontSize={24} gutterBottom>
//         Ders Seçin
//       </Typography>
//       <TextField
//         select
//         label="Ders Seç"
//         value={selectedCourseId || ''}
//         onChange={(e) => setSelectedCourseId(e.target.value)}
//         fullWidth
//         variant="outlined"
//         sx={{ mb: 2 }}
//       >
//         {courses.map((course) => (
//           <MenuItem key={course.id} value={course.id}>
//             {course.name}
//           </MenuItem>
//         ))}
//       </TextField>

//       {selectedCourseId && (
//         <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
//           <DatePicker
//             label="Yoklama Tarihi Seç"
//             value={selectedDate}
//             onChange={(newValue) => setSelectedDate(newValue)}
//             disableFuture
//             slotProps={{
//               textField: {
//                 variant: 'outlined',
//                 size: 'small',
//                 sx: { mb: 2, width: 220 },
//               },
//             }}
//           />
//         </LocalizationProvider>
//       )}

//       <Grid container spacing={2} mb={2}>
//         <Grid>
//           <Card sx={{ backgroundColor: '#e3f2fd' }}>
//             <CardContent>
//               <Typography variant="h6">Toplam Öğrenci</Typography>
//               <Typography variant="h4">{total}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid>
//           <Card sx={{ backgroundColor: '#c8e6c9' }}>
//             <CardContent>
//               <Typography variant="h6">Katıldı</Typography>
//               <Typography variant="h4">{attended}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid>
//           <Card sx={{ backgroundColor: '#fff9c4' }}>
//             <CardContent>
//               <Typography variant="h6">Geç Kaldı</Typography>
//               <Typography variant="h4">{late}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid>
//           <Card sx={{ backgroundColor: '#ffcdd2' }}>
//             <CardContent>
//               <Typography variant="h6">Katılmadı</Typography>
//               <Typography variant="h4">{absent}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {loading ? (
//         <CircularProgress />
//       ) : error ? (
//         <Alert severity="error">{error}</Alert>
//       ) : (
//         <DataGrid
//           rows={students}
//           columns={columns}
//           getRowId={(row) => row.id}
//           autoHeight
//           sx={{ backgroundColor: 'white', borderRadius: 2, mt: 2 }}
//         />
//       )}
//     </Box>
//   );
// };

// export default AttendanceByDate;

// src/pages/AttendanceByDate.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import {
  getStudentsByCourseId,
  getAttendanceByCourseAndDate,
  getAllCourses,
  getAttendanceStatsForStudents,
} from "../services/authService";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useOutletContext } from "react-router-dom";

import DashboardCards from "../components/dashboardCards";

interface OutletContextType {
  selectedTerm: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  number: string;
  status?: string;
  attended?: number;
  late?: number;
  absent?: number;
}

interface AttendanceRecord {
  student_id: string;
  status: string;
}

const AttendanceByDate: React.FC = () => {
  const { selectedTerm } = useOutletContext<OutletContextType>();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateHasAttendance, setDateHasAttendance] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchCourses = async () => {
    if (!selectedTerm) return;
    try {
      const allCourses = await getAllCourses();
      const filtered = allCourses.filter((c: any) => c.term === selectedTerm);
      setCourses(filtered);
    } catch {
      setError("Dersler alınırken hata oluştu.");
    }
  };

  const fetchData = async (dateStr: string | null) => {
    if (!selectedCourseId) return;

    try {
      setLoading(true);
      setError("");

      const studentData: Student[] = await getStudentsByCourseId(
        selectedCourseId
      );
      const attendanceStats = await getAttendanceStatsForStudents(
        selectedCourseId
      );

      let mapped: Record<string, string> = {};
      if (dateStr) {
        const attendanceData: AttendanceRecord[] =
          await getAttendanceByCourseAndDate(selectedCourseId, dateStr);
        if (attendanceData.length > 0) {
          mapped = attendanceData.reduce(
            (acc: Record<string, string>, record: AttendanceRecord) => {
              acc[record.student_id] = record.status;
              return acc;
            },
            {} as Record<string, string>
          );
          setDateHasAttendance(true);
        } else {
          setDateHasAttendance(false);
        }
      }

      const updated = studentData.map((s: Student) => {
        const stats = attendanceStats[String(s.id)] || {
          attended: 0,
          late: 0,
          absent: 0,
        };

        return {
          ...s,
          attended: stats.attended,
          late: stats.late,
          absent: stats.absent,
          status: mapped[s.id] || "",
        };
      });

      setStudents(updated);
    } catch {
      setError("Veriler alınırken hata oluştu.");
      setStudents([]);
      setDateHasAttendance(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedTerm]);

  useEffect(() => {
    const formatted = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
    if (selectedCourseId) fetchData(formatted);
  }, [selectedCourseId, selectedDate]);

  if (!selectedTerm) {
    return (
      <Box mt={4}>
        <Alert severity="info">Lütfen önce dönem seçiniz.</Alert>
      </Box>
    );
  }

  const total = students.length;
  const attended = students.filter((s) => s.status === "Katıldı").length;
  const late = students.filter((s) => s.status === "Geç Kaldı").length;
  const absent = students.filter((s) => s.status === "Katılmadı").length;

  const columns: GridColDef[] = [
    {
      field: "status",
      headerName: "Bu Tarih",
      headerClassName: "headerStyles",
      flex: 1,
      renderCell: (params) => {
        if (!selectedDate)
          return (
            <Typography color="text.secondary">Tarih seçilmedi</Typography>
          );
        if (!dateHasAttendance)
          return (
            <Typography color="text.secondary">Yoklama alınmamış</Typography>
          );
        return <Typography>{params.value || "—"}</Typography>;
      },
    },
    {
      field: "name",
      headerName: "Ad Soyad",
      flex: 1,
      headerClassName: "headerStyles",
    },
    {
      field: "email",
      headerName: "E-Posta",
      flex: 1,
      headerClassName: "headerStyles",
    },
    {
      field: "number",
      headerName: "Öğrenci No",
      flex: 1,
      headerClassName: "headerStyles ",
    },
  ];

  return (
    <Box mt={4}>
      <Typography variant="h6" color="primary" fontSize={24} gutterBottom>
        Ders Seçin
      </Typography>

      <TextField
        select
        label="Ders Seç"
        value={selectedCourseId || ""}
        onChange={(e) => setSelectedCourseId(e.target.value)}
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      >
        {courses.map((course) => (
          <MenuItem key={course.id} value={course.id}>
            {course.name}
          </MenuItem>
        ))}
      </TextField>

      {selectedCourseId && (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
          <DatePicker
            label="Yoklama Tarihi Seç"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            disableFuture
            slotProps={{
              textField: {
                variant: "outlined",
                size: "small",
                sx: { mb: 2, width: 220 },
              },
            }}
          />
        </LocalizationProvider>
      )}

      <DashboardCards
        totalStudents={total}
        attended={attended}
        late={late}
        absent={absent}
      />

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <DataGrid
          rows={students}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          sx={{ backgroundColor: "white", borderRadius: 2, mt: 2 }}
        />
      )}
    </Box>
  );
};

export default AttendanceByDate;
