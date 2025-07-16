import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import TodayIcon from '@mui/icons-material/Today';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getTodaySchedule, getPendingAttendance } from '../services/authService';
import { useNavigate, useOutletContext } from 'react-router-dom';

interface OutletContextType {
  selectedTerm: string;
}



const compareNowWithTimes = (
  startTimeStr: string,
  endTimeStr: string
): 'before' | 'during' | 'after' => {
  const now = new Date();

  const [startHour, startMinute] = startTimeStr.split(':').map(Number);
  const [endHour, endMinute] = endTimeStr.split(':').map(Number);

  const today = new Date();
  const startTime = new Date(today);
  startTime.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date(today);
  endTime.setHours(endHour, endMinute, 59, 999);

  if (now < startTime) return 'before';
  if (now > endTime) return 'after';
  return 'during';
};

const Dashboard: React.FC = () => {
  const [todayLessons, setTodayLessons] = useState<any[]>([]);
  const [pendingAttendances, setPendingAttendances] = useState<any[]>([]);
  const { selectedTerm } = useOutletContext<OutletContextType>();

  const currentTime = new Date();
  const formattedDate = format(currentTime, 'd MMMM yyyy, EEEE', { locale: tr });
  const navigate = useNavigate();
  
  const handleCourseSelect = (id: any) => {
    console.log(id)
    navigate(`/dashboard/courseStudents/${id}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!selectedTerm) return; // Boşsa fetch etme
        // 1. Bugünkü ders programını al
        const lessons = await getTodaySchedule(selectedTerm);
        setTodayLessons(lessons);

        // 2. Tüm yoklaması alınmamış dersleri çek (bugün ve süresi geçmiş olanlar)
        const pending = await getPendingAttendance(selectedTerm);

        // 3. Sadece şu an devam edenleri filtrele
        // const filteredPending = pending.filter((lesson) => {
        //   const status = compareNowWithTimes(lesson.start_time, lesson.end_time);
        //   return status === 'during';
        // });

        setPendingAttendances(pending);
      } catch (error) {
        console.error('Dashboard verileri alınamadı', error);
      }
    };

    fetchDashboardData();
  }, [selectedTerm]);

  return (
    <Box
      sx={{
        backgroundColor: '#f5f8fb',
        borderRadius: 3,
        boxShadow: '0 6px 20px rgba(32, 60, 81, 0.08)',
        maxWidth: '900px',
        mx: 'auto',
        p: 4,
        userSelect: 'none',
      }}
    >
      {/* Tarih Kartı */}
      <Card
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          borderRadius: 3,
          mb: 4,
          boxShadow: '0 8px 15px rgba(25, 118, 210, 0.4)',
        }}
      >
        <CardContent>
          <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Merhaba 👋
              </Typography>
            </Grid>
            <Grid>
              <Typography
                variant="subtitle1"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Bugün: {formattedDate}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bugünkü Dersler */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: '#0d47a1', fontWeight: 'bold' }}
      >
        Bugünkü Dersler
      </Typography>

      <Grid container spacing={3}>
        {todayLessons.length === 0 ? (
          <Grid >
            <Alert severity="info">Bugün için tanımlı ders bulunmamaktadır.</Alert>
          </Grid>
        ) : (
          todayLessons.map((lesson) => {
            const status = compareNowWithTimes(lesson.start_time, lesson.end_time);

            const statusText =
              status === 'before'
                ? `🕐 ${lesson.start_time} başlayacak`
                : status === 'during'
                ? `⏳ Şu an devam ediyor (${lesson.start_time} - ${lesson.end_time})`
                : `✅ Ders sona erdi (${lesson.start_time} - ${lesson.end_time})`;

            return (
              <Grid key={lesson.id}>
                <Card
                  sx={{
                    backgroundColor: '#f7f9fc',
                    borderLeft: '5px solid #1976d2',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <TodayIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight={700}>
                        {lesson.course.name}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {lesson.course.code} | Salon: {lesson.room}
                    </Typography>
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={statusText}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Yoklaması Alınmamış Dersler */}
      <Box mt={6}  >
        <Typography  variant="h6"
        gutterBottom
        sx={{ color: '#0d47a1', fontWeight: 'bold' }}> Yoklaması Alınmamış Dersler</Typography>
        <Grid container spacing={3}>
           {pendingAttendances.map((item) => (
             <Grid key={item.id} sx={{cursor:'pointer'}} onClick={() => handleCourseSelect(item.courses.id)}>
                            {/*  */}
               <Card
                 sx={{
                 borderLeft: '6px solid #ff9800',
                 backgroundColor: '#fff8e1',
                 boxShadow: '0 3px 8px rgba(255, 152, 0, 0.3)',
                 height: '100%', }} 
               >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <InfoIcon color="warning" />
                    <Typography fontWeight={700} color="#bf360c">
                       {item.courses.name}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                      {item.start_time} - {item.end_time} / Salon: {item.room}
                  </Typography>
                  <Typography variant="caption" color="error" fontWeight={600}>
                     Bu oturum için yoklama alınmamış!
                  </Typography>
                </CardContent>
               </Card>
              </Grid>
  ))}
</Grid>

      </Box>
    </Box>
  );
};

export default Dashboard;
