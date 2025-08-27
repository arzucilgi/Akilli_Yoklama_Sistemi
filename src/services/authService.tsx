// src/services/authService.ts
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

interface SignUpData {
  name: string;
  surname: string;
  email: string;
  password: string;
}

interface Course {
  term: string;
}

// interface StudentCourse {
//   student_id: string;
//   students: {
//     name: string;
//     email: string;
//     number: string;
//   };
// }

interface AttendanceRecord {
  student_id: string;
  status: "Katıldı" | "Geç Kaldı" | "Katılmadı";
}

interface DailyAttendanceRecord {
  status: "Katıldı" | "Geç Kaldı" | "Katılmadı";
  date: string;
}

// export async function signInWithEmail(email: string, password: string) {
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) throw new Error(error.message);
//   return data;
// }

export async function signInWithEmail(email: string, password: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !user) {
    throw new Error(authError?.message || "Giriş başarısız");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error("Profil bilgileri alınamadı: " + profileError.message);
  }

  return {
    user,
    profile,
  };
}

export async function signUpWithEmail({
  name,
  surname,
  email,
  password,
}: SignUpData) {
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw new Error(signUpError.message);

  if (!data.user) throw new Error("Kullanıcı oluşturulamadı");

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    name,
    surname,
    email,
  });

  if (profileError) throw new Error(profileError.message);

  return data;
}

export async function getAllTerms(): Promise<string[]> {
  const { data, error } = await supabase.from("courses").select("term");
  if (error) {
    toast.error(error.message);
    return [];
  }

  const uniqueTerms = [
    ...new Set((data as Course[]).map((course) => course.term)),
  ];
  return uniqueTerms;
}

export async function getCoursesByTerm(term: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("id, name, code, time, room")
    .eq("term", term);

  if (error) {
    toast.error(error.message);
    return [];
  }
  return data;
}

//Günlük yoklamayı topluca veritabanına aktarmak istiyorsan
export const submitAttendanceForStudents = async (attendanceData: any[]) => {
  console.log("Upsert edilecek veri:", attendanceData);

  const { data, error } = await supabase
    .from("attendances")
    .upsert(attendanceData, {
      onConflict: "student_id,course_id,date",
    });

  if (error) {
    console.error("Yoklama kayıt hatası:", error.message);
  } else {
    console.log("Yoklama başarıyla kaydedildi:", data);
  }

  return { data, error };
};

export const getAttendanceByCourseAndDate = async (
  courseId: string,
  date: string
) => {
  const { data, error } = await supabase
    .from("attendances")
    .select("*")
    .eq("course_id", courseId)
    .eq("date", date);

  if (error) throw error;
  return data;
};

export const getCourseSchedule = async (term: string) => {
  const { data, error } = await supabase
    .from("course_schedule")
    .select(
      `
      id,
      weekday,
      start_time,
      end_time,
      room,
      course:course_id ( id, name, code )
    `
    )
    .eq("term", term);

  if (error) throw error;
  return data;
};

//Belirtilen kursa kayıtlı öğrencilerin temel bilgilerini (isim, email, numara) getirir ve bu veriyi sadeleştirilmiş bir dizi halinde döner.
export const getStudentsByCourseId = async (courseId: string) => {
  const { data, error } = await supabase
    .from("student_courses")
    .select("student_id, students(name, email, number)")
    .eq("course_id", courseId);

  if (error) throw error;

  return data.map((item: any) => ({
    id: item.student_id,
    name: item.students.name,
    email: item.students.email,
    number: item.students.number,
  }));
};

export async function getCourseById(courseId: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("name")
    .eq("id", courseId)
    .single();

  if (error) throw error;
  return data;
}

export const getScheduleByCourseId = async (courseId: string) => {
  const { data, error } = await supabase
    .from("course_schedule")
    .select("*")
    .eq("course_id", courseId);

  if (error) throw error;
  return data;
};

export const getAllCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Kurslar alınırken hata:", error.message);
    return [];
  }

  return data;
};

export const getAttendanceStatsForStudents = async (courseId: string) => {
  const { data, error } = await supabase
    .from("attendances")
    .select("student_id, status")
    .eq("course_id", courseId);

  if (error) {
    console.error("Yoklama istatistikleri alınamadı:", error);
    return {};
  }

  const stats: Record<
    string,
    { attended: number; late: number; absent: number }
  > = {};

  (data as AttendanceRecord[]).forEach(({ student_id, status }) => {
    const sid = String(student_id);
    if (!stats[sid]) stats[sid] = { attended: 0, late: 0, absent: 0 };

    if (status === "Katıldı") stats[sid].attended++;
    else if (status === "Geç Kaldı") stats[sid].late++;
    else if (status === "Katılmadı") stats[sid].absent++;
  });

  return stats;
};

export const getTodaySchedule = async (term: string) => {
  const today = new Date();
  const weekday = today.toLocaleDateString("tr-TR", { weekday: "long" });

  const { data, error } = await supabase
    .from("course_schedule")
    .select(
      `
      id,
      weekday,
      start_time,
      end_time,
      room,
      course:course_id (
        id,
        name,
        code
      )
    `
    )
    .eq("term", term)
    .eq("weekday", weekday)
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data;
};

const days = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];
const getTodayName = () => days[new Date().getDay()];

export const getPendingAttendance = async (selectedTerm: string) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayName = getTodayName();

  const { data: schedules, error: scheduleError } = await supabase
    .from("course_schedule")
    .select(
      `
      id,
      course_id,
      start_time,
      end_time,
      room,
      weekday,
      courses (
        id,
        name,
        code
      )
    `
    )
    .eq("term", selectedTerm)
    .eq("weekday", todayName)
    .order("start_time", { ascending: true });

  if (scheduleError) throw scheduleError;

  const pendingLessons: typeof schedules = [];

  for (const schedule of schedules as any[]) {
    const { data: attendance, error: attendanceError } = await supabase
      .from("attendances")
      .select("id")
      .eq("course_id", schedule.course_id)
      .eq("date", todayStr);

    if (attendanceError) throw attendanceError;

    if (!attendance || attendance.length === 0) pendingLessons.push(schedule);
  }

  return pendingLessons;
};

export const getWeeksByCourseAndTerm = async (courseId: string) => {
  const { data, error } = await supabase
    .from("attendances")
    .select("date")
    .eq("course_id", courseId);

  if (error) throw error;

  const uniqueWeeks = Array.from(
    new Set((data as { date: string }[]).map((item) => item.date))
  ).sort();
  return uniqueWeeks;
};

import { startOfWeek, endOfWeek } from "date-fns";

export const getWeeklyAttendanceStats = async (
  courseId: string,
  selectedWeek: string
) => {
  const start = startOfWeek(new Date(selectedWeek), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(selectedWeek), { weekStartsOn: 1 });

  const { data, error } = await supabase
    .from("attendances")
    .select("status, date")
    .eq("course_id", courseId)
    .gte("date", start.toISOString().split("T")[0])
    .lte("date", end.toISOString().split("T")[0]);

  if (error) throw error;

  const stats = {
    week: `${start.toISOString().split("T")[0]} - ${
      end.toISOString().split("T")[0]
    }`,
    Katıldı: 0,
    "Geç Kaldı": 0,
    Katılmadı: 0,
  };

  (data as DailyAttendanceRecord[]).forEach((record) => {
    if (record.status in stats) stats[record.status as keyof typeof stats]++;
  });

  return [stats];
};

type AttendanceStatus = {
  Katıldı: number;
  "Geç Kaldı": number;
  Katılmadı: number;
};

export const getDailyAttendanceStats = async (
  courseId: string,
  selectedWeek: string
) => {
  const start = startOfWeek(new Date(selectedWeek), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(selectedWeek), { weekStartsOn: 1 });

  const { data, error } = await supabase
    .from("attendances")
    .select("status, date")
    .eq("course_id", courseId)
    .gte("date", start.toISOString().split("T")[0])
    .lte("date", end.toISOString().split("T")[0]);

  if (error) throw error;

  const grouped: Record<string, AttendanceStatus> = {};

  (data as DailyAttendanceRecord[]).forEach((record) => {
    const day = record.date;
    if (!grouped[day])
      grouped[day] = { Katıldı: 0, "Geç Kaldı": 0, Katılmadı: 0 };
    if (record.status in grouped[day])
      grouped[day][record.status as keyof AttendanceStatus]++;
  });

  return Object.entries(grouped).map(([day, status]) => ({
    date: day,
    ...status,
  }));
};

export const getCurrentUserProfile = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw userError || new Error("Kullanıcı bulunamadı");

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
};
