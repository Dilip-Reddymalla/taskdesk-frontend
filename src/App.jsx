import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import PlansPage from './pages/PlansPage';
import PlanDetailPage from './pages/PlanDetailPage';
import PlanLogPage from './pages/PlanLogPage';
import ProfilePage from './pages/ProfilePage';
import InvitesPage from './pages/InvitesPage';
import NotFoundPage from './pages/NotFoundPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes — wrapped in AppLayout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout><DashboardPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <AppLayout><TasksPage key="tasks-page-root" /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <AppLayout><CalendarPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans"
                element={
                  <ProtectedRoute>
                    <AppLayout><PlansPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans/:planId"
                element={
                  <ProtectedRoute>
                    <AppLayout><PlanDetailPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans/:planId/log"
                element={
                  <ProtectedRoute>
                    <AppLayout><PlanLogPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout><ProfilePage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invites"
                element={
                  <ProtectedRoute>
                    <AppLayout><InvitesPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Verify Email -> No Layout wrappers just the full page auth style */}
              <Route
                path="/verify-email"
                element={
                  <ProtectedRoute>
                    <VerifyEmailPage />
                  </ProtectedRoute>
                }
              />

              {/* Google OAuth callback */}
              <Route path="/auth/callback" element={<GoogleCallbackPage />} />

              {/* Fallback */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
