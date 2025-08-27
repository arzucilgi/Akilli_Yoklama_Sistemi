// src/components/StudentAttendanceStats.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getCoursesByTerm,
  getAttendanceStatsForStudents,
  getStudentsByCourseId,
} from "../services/authService";
import { useOutletContext } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

interface OutletContextType {
  selectedTerm: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  number: string;
}

interface StudentStats extends Student {
  Katıldı: number;
  "Geç Kaldı": number;
  Katılmadı: number;
}

const StudentAttendanceStats: React.FC = () => {
  const { selectedTerm } = useOutletContext<OutletContextType>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [stats, setStats] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!selectedTerm) return;
    setSelectedCourseId("");
    setStats([]);
    const fetchCourses = async () => {
      try {
        const res: Course[] = await getCoursesByTerm(selectedTerm);
        setCourses(res);
      } catch {
        setError("Dersler alınamadı");
      }
    };
    fetchCourses();
  }, [selectedTerm]);

  useEffect(() => {
    if (!selectedCourseId) {
      setStats([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const studentList: Student[] = await getStudentsByCourseId(
          selectedCourseId
        );
        const attendanceStats: Record<
          string,
          { attended: number; late: number; absent: number }
        > = await getAttendanceStatsForStudents(selectedCourseId);

        const merged: StudentStats[] = studentList.map((student) => {
          const s = attendanceStats[student.id] || {
            attended: 0,
            late: 0,
            absent: 0,
          };
          return {
            id: student.id,
            name: student.name,
            email: student.email,
            number: student.number,
            Katıldı: s.attended,
            "Geç Kaldı": s.late,
            Katılmadı: s.absent,
          };
        });

        setStats(merged);
      } catch {
        setError("İstatistikler alınamadı");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCourseId]);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Ad Soyad",
      flex: 1,
      headerClassName: "headerStyles",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      headerClassName: "headerStyles",
    },
    {
      field: "number",
      headerName: "Öğrenci No",
      flex: 1,
      headerClassName: "headerStyles",
    },
    {
      field: "Katıldı",
      headerName: "Katıldı",
      type: "number",
      flex: 0.8,
      headerClassName: "headerStyles",
    },
    {
      field: "Geç Kaldı",
      headerName: "Geç Kaldı",
      type: "number",
      flex: 0.8,
      headerClassName: "headerStyles",
    },
    {
      field: "Katılmadı",
      headerName: "Katılmadı",
      type: "number",
      flex: 0.8,
      headerClassName: "headerStyles",
    },
  ];

  return (
    <Card
      sx={{
        p: 4,
        m: 10,
        backgroundColor: "#f5f8fb",
        width: { xs: "95%", md: "90%" },
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#0c3e8b",
          mb: 4,
          textAlign: "center",
        }}
      >
        Öğrenci Bazlı Katılım İstatistikleri
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Ders Seç</InputLabel>
          <Select
            value={selectedCourseId}
            label="Ders Seç"
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={!courses.length}
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name} ({course.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && stats.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={stats}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" type="category" />
              <YAxis type="number" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Katıldı" fill="#7dca7fff" />
              <Bar dataKey="Geç Kaldı" fill="#faca84ff" />
              <Bar dataKey="Katılmadı" fill="#f1655bff" />
            </BarChart>
          </ResponsiveContainer>

          <Box sx={{ width: "100%", mt: 5 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: "bold", color: "#0c3e8b" }}
            >
              Öğrenci Listesi ve Detaylı İstatistik
            </Typography>
            <DataGrid
              rows={stats}
              columns={columns}
              autoHeight
              pageSizeOptions={[5, 10, 20]}
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f0f0f0",
                },
              }}
            />
          </Box>
        </>
      )}

      {!loading && !error && stats.length === 0 && (
        <Typography>
          Seçilen derse ait öğrenci katılım verisi bulunamadı.
        </Typography>
      )}
    </Card>
  );
};

export default StudentAttendanceStats;
