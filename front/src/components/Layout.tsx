import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-brand">Service Desk AI</div>
        
        <div className="nav-links">
          {user.role === 'standard-user' && (
            <Link to="/report-issue" className="nav-link">Report Issue</Link>
          )}
          
          {user.role === 'service-desk-user' && (
            <Link to="/issues" className="nav-link">Issue Log</Link>
          )}
          
          {user.role === 'admin-user' && (
            <Link to="/admin" className="nav-link">Admin Panel</Link>
          )}
          
          <Link to="/chat" className="nav-link">Chat</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          
          <button onClick={handleLogout} className="nav-link logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
