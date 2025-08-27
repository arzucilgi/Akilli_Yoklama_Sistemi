// src/components/WeeklyAttendanceStats.tsx
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
import { format } from "date-fns";
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
  getWeeksByCourseAndTerm,
  getWeeklyAttendanceStats,
  getDailyAttendanceStats,
} from "../services/authService";
import { useOutletContext } from "react-router-dom";

interface OutletContextType {
  selectedTerm: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface WeeklyStat {
  week: string;
  Katıldı: number;
  "Geç Kaldı": number;
  Katılmadı: number;
}

interface DailyStat {
  date: string;
  Katıldı: number;
  "Geç Kaldı": number;
  Katılmadı: number;
}

const WeeklyAttendanceStats: React.FC = () => {
  const { selectedTerm } = useOutletContext<OutletContextType>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [weeks, setWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [data, setData] = useState<WeeklyStat[]>([]);
  const [dailyData, setDailyData] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!selectedTerm) return;
    setSelectedCourseId("");
    setWeeks([]);
    setSelectedWeek("");
    setData([]);
    setDailyData([]);
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
      setWeeks([]);
      setSelectedWeek("");
      setData([]);
      setDailyData([]);
      return;
    }
    const fetchWeeks = async () => {
      setLoading(true);
      setError("");
      try {
        // Tipi string[] olarak belirt
        const res: string[] = (await getWeeksByCourseAndTerm(
          selectedCourseId
        )) as string[];
        setWeeks(res);
        if (res.length > 0) setSelectedWeek(res[0]);
      } catch {
        setError("Haftalar alınamadı");
      } finally {
        setLoading(false);
      }
    };
    fetchWeeks();
  }, [selectedCourseId, selectedTerm]);

  useEffect(() => {
    if (!selectedCourseId || !selectedWeek) {
      setData([]);
      setDailyData([]);
      return;
    }
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const stats: WeeklyStat[] = await getWeeklyAttendanceStats(
          selectedCourseId,
          selectedWeek
        );
        const daily: DailyStat[] = await getDailyAttendanceStats(
          selectedCourseId,
          selectedWeek
        );
        setData(stats);
        setDailyData(daily);
      } catch {
        setError("İstatistikler alınamadı");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedCourseId, selectedWeek, selectedTerm]);

  return (
    <Card
      sx={{
        p: 4,
        m: 10,
        backgroundColor: "#f5f8fb",
        width: { xs: "95%", md: "70%" },
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 6px 30px rgba(0,0,0,0.15)",
        },
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
        Haftalık Katılım İstatistikleri
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

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Hafta Seç</InputLabel>
          <Select
            value={selectedWeek}
            label="Hafta Seç"
            onChange={(e) => setSelectedWeek(e.target.value)}
            disabled={!weeks.length}
          >
            {weeks.map((week) => (
              <MenuItem key={week} value={week}>
                {format(new Date(week), "dd MMM yyyy")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && data.length > 0 && (
        <>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold", color: "#0c3e8b" }}
          >
            Haftalık Toplam
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barSize={130}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                }}
              />
              <Legend />
              <Bar dataKey="Katıldı" fill="#4caf50" />
              <Bar dataKey="Geç Kaldı" fill="#ff9800" />
              <Bar dataKey="Katılmadı" fill="#f44336" />
            </BarChart>
          </ResponsiveContainer>

          <Typography
            variant="h6"
            sx={{ mt: 5, mb: 2, fontWeight: "bold", color: "#0c3e8b" }}
          >
            Günlük Dağılım
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData} barSize={50}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                }}
              />
              <Legend />
              <Bar dataKey="Katıldı" fill="#4caf50" />
              <Bar dataKey="Geç Kaldı" fill="#ff9800" />
              <Bar dataKey="Katılmadı" fill="#f44336" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      {!loading && !error && data.length === 0 && (
        <Typography sx={{ mt: 2 }}>
          Seçilen kriterlere göre veri bulunamadı.
        </Typography>
      )}
    </Card>
  );
};

export default WeeklyAttendanceStats;
