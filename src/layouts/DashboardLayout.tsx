import  { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import PrimarySearchAppBar from '../components/appBar';

const DashboardLayout = () => {
  // Ders veya dönem seçimi için state
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflowY: 'auto',
      }}
    >
      <PrimarySearchAppBar
        selectedTerm={selectedTerm}
        onTermChange={setSelectedTerm}
        // Ders seçim veya program ekranı için diğer fonksiyonlar PrimarySearchAppBar içinde yönlendirme yapıyor.
        onCourseSelect={() => {}}  // Eğer ders seçimine ihtiyacınız varsa, burada ekleyebilirsiniz.
        onScheduleClick={() => {}}
      />

      <Box
        sx={{
          flexGrow: 1,
          p: 2,
          // margin:2,
          // display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row',
          overflow: 'auto',               // Scroll içeride çıksın
          maxHeight: '100%',             // İçerik taşarsa scroll bu sınırda oluşur
          
          // justifyContent:'center'
        }}
      >
        {/* Outlet içine geçecek olan sayfa, güncel olarak CourseSchedulePage olacak */}
        <Outlet context={{ selectedTerm }} />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
