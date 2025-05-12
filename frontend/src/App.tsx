import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TasksPage from './pages/TasksPage';

// Components
import DashboardLayout from './components/dashboard/DashboardLayout';
import ProtectedRoute from './utils/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/tasks" element={<TasksPage />} />
            </Route>
          </Route>
          
          {/* Redirect root to tasks */}
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          
          {/* Fallback for undefined routes */}
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#1E40AF',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#991B1B',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;