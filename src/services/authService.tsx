// src/services/authService.ts
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

interface SignUpData {
  name: string;
  surname: string;
  email: string;
  password: string;
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
  // 1. Giriş işlemi
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

  // 2. Kullanıcıya ait profil bilgilerini al
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error("Profil bilgileri alınamadı: " + profileError.message);
  }

  // 3. Hem auth verisi hem de profil verisi dönülür
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
  // 1. Supabase Auth ile kullanıcı oluştur
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw new Error(signUpError.message);

  if (!data.user) throw new Error("Kullanıcı oluşturulamadı");

  // 2. Kullanıcı ID'si ile profili oluştur
  const { error: profileError } = await supabase
    .from("profiles") // kendi profil tablonun adı
    .insert({
      id: data.user.id, // auth tarafından oluşturulan user id
      name,
      surname,
      email,
    });

  if (profileError) throw new Error(profileError.message);

  return data;
}

// Dönemleri getir
export async function getAllTerms(): Promise<string[]> {
  const { data, error } = await supabase.from("courses").select("term");
  if (error) {
    toast.error(error.message);
    return [];
  }
  // Tekrarlı dönem isimlerini filtrele
  const uniqueTerms = [...new Set(data.map((course) => course.term))];
  return uniqueTerms;
}

// Seçilen döneme göre dersleri getir
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

// export const getStudentsByCourseId = async (courseId: string) => {
//   const { data, error } = await supabase
//     .from('student_courses')
//     .select('student_id, students ( id, name, email, number )')
//     .eq('course_id', courseId);

//   if (error) throw error;

//   return data.map((item: any) => ({
//     id: item.students.id,
//     name: item.students.name,
//     email: item.students.email,
//     number: item.students.number,
//   }));
// };

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

//Belirli bir derste ve belirli bir tarihte yapılan tüm yoklama kayıtlarını getirir.
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

//Belirtilen döneme ait derslerin program bilgilerini (gün, saat, oda, ders bilgileri) veritabanından çekip getirir.
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

// id ile ders bilgisini getir
export async function getCourseById(courseId: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("name")
    .eq("id", courseId)
    .single();

  if (error) throw error;
  return data;
}

//Belirtilen kursa ait tüm ders programı kayıtlarını getirir.
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

// O kursa kayıtlı öğrenci bazında katılım, geç kalma ve yoklama sayıları olan bir nesne döndürülür.
export const getAttendanceStatsForStudents = async (courseId: string) => {
  const { data, error } = await supabase
    .from("attendances") // doğru tablo adı
    .select("student_id, status")
    .eq("course_id", courseId);

  if (error) {
    console.error("Yoklama istatistikleri alınamadı:", error);
    return {};
  }

  const stats: Record<
    string,
    {
      attended: number;
      late: number;
      absent: number;
    }
  > = {};

  data.forEach(({ student_id, status }) => {
    const sid = String(student_id); // uuid'leri string'e çevirerek anahtar yap
    if (!stats[sid]) {
      stats[sid] = { attended: 0, late: 0, absent: 0 };
    }

    if (status === "Katıldı") {
      stats[sid].attended++;
    } else if (status === "Geç Kaldı") {
      stats[sid].late++;
    } else if (status === "Katılmadı") {
      stats[sid].absent++;
    }
  });

  return stats;
};

// Bugünkü dersleri getir (giriş yapan kullanıcının dönemine göre filtrelenmiş)
export const getTodaySchedule = async (term: string) => {
  const today = new Date();
  const weekday = today.toLocaleDateString("tr-TR", { weekday: "long" }); // Örn: Pazartesi

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

// Yardımcı fonksiyon: Bugünün adı
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

//Bugün için seçilen dönemde, saat olarak henüz devam eden ve yoklaması alınmamış derslerin listesini getirir.
export const getPendingAttendance = async (selectedTerm: string) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
  // const nowStr = today.toTimeString().slice(0, 5); // HH:mm
  const todayName = getTodayName();

  // 1. Bugünün derslerini al (start_time veya end_time farketmez, tüm dersler)
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

  // 2. Devam eden veya bitmiş dersleri filtrele
  // const relevantSchedules = schedules.filter(s => s.end_time >= nowStr);

  // Hiç filtreleme yapma, çünkü hepsini kontrol etmek istiyoruz:
  const relevantSchedules = schedules;

  const pendingLessons: any[] = [];

  // 3. Her ders için o güne ait yoklama kontrolü
  for (const schedule of relevantSchedules) {
    const { data: attendance, error: attendanceError } = await supabase
      .from("attendances")
      .select("id")
      .eq("course_id", schedule.course_id)
      .eq("date", todayStr);

    if (attendanceError) throw attendanceError;

    // Eğer yoklama yoksa ekle
    if (!attendance || attendance.length === 0) {
      pendingLessons.push(schedule);
    }
  }

  return pendingLessons;
};

//Bu fonksiyon, seçilen derse ait yoklama kayıtlarında kaç farklı tarih olduğunu
// (yani haftalık ya da günlük katılım verisi olan tarihleri) bulmak ve bu tarihleri sıralı olarak almak için kullanılır.
export const getWeeksByCourseAndTerm = async (courseId: string) => {
  const { data, error } = await supabase
    .from("attendances")
    .select("date")
    .eq("course_id", courseId);

  if (error) throw error;

  const uniqueWeeks = Array.from(new Set(data.map((item) => item.date))).sort();
  return uniqueWeeks;
};

//Bu fonksiyon, bir derse (courseId) ve seçilen haftaya (selectedWeek) ait haftalık yoklama istatistiklerini getirir.
import { startOfWeek, endOfWeek } from "date-fns";

export const getWeeklyAttendanceStats = async (
  courseId: string,
  selectedWeek: string
) => {
  const start = startOfWeek(new Date(selectedWeek), { weekStartsOn: 1 }); // Pazartesi
  const end = endOfWeek(new Date(selectedWeek), { weekStartsOn: 1 }); // Pazar

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

  for (const record of data) {
    if (record.status in stats) {
      stats[record.status as keyof typeof stats]++;
    }
  }

  return [stats];
};

// GÜN BAZLI YOKLAMA VERİLERİ GETİR
type AttendanceStatus = {
  Katıldı: number;
  "Geç Kaldı": number;
  Katılmadı: number;
};

export const getDailyAttendanceStats = async (
  courseId: string,
  selectedWeek: string
) => {
  const start = startOfWeek(new Date(selectedWeek), { weekStartsOn: 1 }); // Pazartesi
  const end = endOfWeek(new Date(selectedWeek), { weekStartsOn: 1 }); // Pazar

  const { data, error } = await supabase
    .from("attendances")
    .select("status, date")
    .eq("course_id", courseId)
    .gte("date", start.toISOString().split("T")[0])
    .lte("date", end.toISOString().split("T")[0]);

  if (error) throw error;

  const grouped: Record<string, AttendanceStatus> = {};

  data.forEach((record) => {
    const day = record.date;
    if (!grouped[day]) {
      grouped[day] = { Katıldı: 0, "Geç Kaldı": 0, Katılmadı: 0 };
    }
    if (record.status in grouped[day]) {
      grouped[day][record.status as keyof AttendanceStatus]++;
    }
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
