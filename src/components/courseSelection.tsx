import React, { useEffect, useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { getAllTerms, getCoursesByTerm } from '../services/authService';

interface CourseSelectionProps {
  onCourseSelect: (courseId: string) => void;
}

const CourseSelection: React.FC<CourseSelectionProps> = ({ onCourseSelect }) => {
  const [terms, setTerms] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseDetails, setCourseDetails] = useState<any>(null);

  // Dönemleri getir
  useEffect(() => {
    const fetchTerms = async () => {
      const terms = await getAllTerms();
      setTerms(terms);
    };
    fetchTerms();
  }, []);

  // Seçilen döneme göre dersleri getir
  useEffect(() => {
    if (!selectedTerm) return;
    const fetchCourses = async () => {
      const courses = await getCoursesByTerm(selectedTerm);
      setCourses(courses);
    };
    fetchCourses();
  }, [selectedTerm]);

  // Ders seçilince detayları göster ve üst komponenti bilgilendir
  useEffect(() => {
    const course = courses.find(c => c.id === selectedCourse);
 
    setCourseDetails(course || null);
    onCourseSelect(selectedCourse); // 🔥 Seçilen kursu üst komponentte bildir
  }, [selectedCourse, courses, onCourseSelect]);

  const handleStartAttendance = () => {
    console.log("Yoklama başlatılıyor:", {
      selectedTerm,
      selectedCourse,
      courseDetails
    });
  };

  return (
    
    
    <Box sx={{  
      display: 'flex',
      width:'80%', 
      flexDirection: 'column', 
      height:'80%',
      justifyContent: 'center',
      alignItems: 'left', 
      border: '1px solid gray',
      borderRadius: '8%',
      m: 1,
      p:2}}>
      <Typography variant="h5" gutterBottom>
        Ders Seçimi
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Dönem</InputLabel>
        <Select
          value={selectedTerm}
          label="Dönem"
          onChange={(e) => setSelectedTerm(e.target.value)}
        >
          {terms.map(term => (
            <MenuItem key={term} value={term}>{term}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedTerm}>
        <InputLabel>Ders</InputLabel>
        <Select
          value={selectedCourse}
          label="Ders"
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          {courses.map(course => (
            <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
          ))}
        </Select>
      

      </FormControl>
      
      {courseDetails && (
        <Box sx={{ mb: 2, borderTop: '1px solid gray', }}>
          <Typography><b>Ders Kodu:</b> {courseDetails.code}</Typography>
          <Typography><b>Saat:</b> {courseDetails.time}</Typography>
          <Typography><b>Sınıf:</b> {courseDetails.room}</Typography>
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleStartAttendance}
        disabled={!selectedCourse}
      >
        Yoklamayı Başlat
      </Button>
    </Box>
    // <>
    //       {/* <AttendanceHistoryPage courseList={courses}/> */}

    // </>
  );
};

export default CourseSelection;
