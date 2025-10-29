import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { IssueLogPage } from './pages/IssueLogPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ChatPage } from './pages/ChatPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Get default route based on user role
function getDefaultRoute(role?: string) {
  switch (role) {
    case 'standard-user':
      return '/report-issue';
    case 'service-desk-user':
      return '/issues';
    case 'admin-user':
      return '/admin';
    default:
      return '/report-issue';
  }
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to={getDefaultRoute(user.role)} replace /> : <LoginPage />} 
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/report-issue"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportIssuePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/issues"
        element={
          <ProtectedRoute>
            <Layout>
              <IssueLogPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Layout>
              <ChatPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/" 
        element={user ? <Navigate to={getDefaultRoute(user.role)} replace /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
