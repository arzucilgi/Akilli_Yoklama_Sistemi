// src/components/CourseStudentsList.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import {
  getStudentsByCourseId,
  getAttendanceByCourseAndDate,
  submitAttendanceForStudents,
  getCourseById,
  getScheduleByCourseId,
} from "../services/authService";
import { toast } from "react-toastify";
import DashboardCards from "./dashboardCards";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import "../App.css";

interface Student {
  id: string;
  name: string;
  email: string;
  number: string;
  status?: string;
}

interface AttendanceRecord {
  student_id: string;
  status: string;
}

interface ScheduleItem {
  weekday: string;
  start_time: string;
  end_time: string;
}

const CourseStudentsList: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  if (!courseId) return <div>Ders ID'si bulunamadı.</div>;

  const [courseName, setCourseName] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Bugünün tarihini ve ders programını kontrol et
  const getTodayScheduleDate = async (
    courseId: string
  ): Promise<string | null> => {
    const schedule: ScheduleItem[] = await getScheduleByCourseId(courseId);
    const today = new Date();
    const todayDay = format(today, "EEEE", { locale: tr }); // Ör: Pazartesi
    const now = format(today, "HH:mm");

    const match = schedule.find(
      (item) =>
        item.weekday === todayDay &&
        now >= item.start_time &&
        now <= item.end_time
    );

    return match ? today.toISOString().slice(0, 10) : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const course = await getCourseById(courseId!);
        setCourseName(course?.name || "");

        const scheduleDate = await getTodayScheduleDate(courseId!);

        if (!scheduleDate) {
          setError("Bugün bu ders için programda bir oturum bulunamadı.");
          setStudents([]);
          setSelectedDate(null);
          return;
        }

        setSelectedDate(scheduleDate);

        const studentData: Student[] = await getStudentsByCourseId(courseId!);
        const attendanceData: AttendanceRecord[] =
          await getAttendanceByCourseAndDate(courseId!, scheduleDate);

        if (attendanceData.length > 0) {
          const mapped: Record<string, string> = attendanceData.reduce(
            (acc: Record<string, string>, record: AttendanceRecord) => {
              acc[record.student_id] = record.status;
              return acc;
            },
            {} as Record<string, string>
          );

          const updatedStudents: Student[] = studentData.map((s) => ({
            ...s,
            status: mapped[s.id] || "",
          }));

          setStudents(updatedStudents);
          setAttendance(mapped);
          setAttendanceTaken(true);
        } else {
          setStudents(studentData.map((s) => ({ ...s, status: "" })));
          setAttendance({});
          setAttendanceTaken(false);
        }
      } catch (err: any) {
        setError("Veriler alınırken hata oluştu.");
        setStudents([]);
        setAttendance({});
        setAttendanceTaken(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleStatusChange = (id: string, value: string) => {
    setAttendance((prev) => ({ ...prev, [id]: value }));
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: value } : s))
    );
  };

  const handleSubmit = async () => {
    if (!selectedDate) return;

    const payload = Object.entries(attendance).map(([student_id, status]) => ({
      student_id,
      course_id: courseId!,
      status,
      date: selectedDate,
    }));

    if (payload.length === 0) {
      toast.error("Yoklama verisi girilmedi.");
      return;
    }

    try {
      const res = await submitAttendanceForStudents(payload);
      if (res.error) {
        toast.error("Yoklama kaydedilemedi.");
      } else {
        toast.success("Yoklama başarıyla kaydedildi.");
        setAttendanceTaken(true);
      }
    } catch {
      toast.error("Beklenmeyen bir hata oluştu.");
    }
  };

  const total = students.length;
  const attended = students.filter((s) => s.status === "Katıldı").length;
  const late = students.filter((s) => s.status === "Geç Kaldı").length;
  const absent = students.filter((s) => s.status === "Katılmadı").length;

  const columns: GridColDef[] = [
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
      headerClassName: "headerStyles",
    },
    {
      field: "status",
      headerName: "Yoklama",
      headerClassName: "headerStyles",
      flex: 1,
      renderCell: (params) => {
        const studentId: string = params.row.id;
        const currentStatus: string = params.row.status || "";

        if (attendanceTaken) {
          return <Typography>{currentStatus || "—"}</Typography>;
        }

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            {["Katıldı", "Geç Kaldı", "Katılmadı"].map((statusOption) => (
              <Button
                key={statusOption}
                variant={
                  currentStatus === statusOption ? "contained" : "outlined"
                }
                color={
                  statusOption === "Katıldı"
                    ? "success"
                    : statusOption === "Geç Kaldı"
                    ? "warning"
                    : "error"
                }
                size="small"
                onClick={() => handleStatusChange(studentId, statusOption)}
              >
                {statusOption}
              </Button>
            ))}
          </Box>
        );
      },
    },
  ];

  return (
    <Box mt={4}>
      <DashboardCards
        totalStudents={total}
        attended={attended}
        late={late}
        absent={absent}
      />

      <Typography variant="h6" color="primary" fontSize={24} gutterBottom>
        {courseName
          ? `${courseName} - Derse Kayıtlı Öğrenciler`
          : "Derse Kayıtlı Öğrenciler"}
      </Typography>

      {selectedDate && (
        <Typography variant="subtitle1" color="text.secondary" mb={2}>
          Yoklama Tarihi: {selectedDate}
        </Typography>
      )}

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <DataGrid
            rows={students}
            columns={columns}
            getRowId={(row) => row.id}
            autoHeight
            sx={{ backgroundColor: "white", borderRadius: 2 }}
            getRowClassName={(params) => {
              if (params.row.status === "Katıldı") return "attended-row";
              if (params.row.status === "Geç Kaldı") return "late-row";
              if (params.row.status === "Katılmadı") return "absent-row";
              return "";
            }}
          />

          {!attendanceTaken && (
            <Box mt={2} textAlign="right">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={
                  Object.keys(attendance).length !== total ||
                  Object.values(attendance).some((v) => !v)
                }
              >
                Yoklamayı Kaydet
              </Button>
            </Box>
          )}

          {attendanceTaken && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Bugün için yoklama zaten alınmış.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default CourseStudentsList;
