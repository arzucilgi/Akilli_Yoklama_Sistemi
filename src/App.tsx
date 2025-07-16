
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/Login';
import Register from './pages/Register';
import CourseSchedulePage from './components/CourseSchedule';
import AttendanceByDate from './components/AttendanceByDate';
import CourseStudentsList from './components/CourseStudentsList';
import Dashboard from './pages/Dashboard';
import WeeklyAttendanceStats from './components/WeeklyAttendanceStats';
import StudentAttendanceStats from './components/StudentAttendanceStats';
import Profile from './components/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      {/* Dashboard layout ve nested route'lar */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="schedule" element={<CourseSchedulePage />} />
        <Route path="courseStudents/:courseId" element={<CourseStudentsList />} />
        <Route path="attendanceByDate" element={<AttendanceByDate/>} />
        <Route path="statistics/course" element={<WeeklyAttendanceStats/>} />
        <Route path="statistics/student" element={<StudentAttendanceStats/>} />
        <Route path="profile" element={<Profile/>} />

 
        {/* Diğer nested route'lar */}
        <Route index element={ <Dashboard/>} />
      </Route>
    </Routes>
  );
}

export default App;

