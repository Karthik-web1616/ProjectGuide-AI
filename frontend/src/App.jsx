import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
