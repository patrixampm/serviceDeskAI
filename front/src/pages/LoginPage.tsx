import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import './LoginPage.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/security/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Fetch user profile after successful login
        const profileResponse = await fetch('http://localhost:3000/api/standard-user/profile', {
          credentials: 'include',
        });
        
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          login(userData);
          
          // Redirect based on user role
          switch (userData.role) {
            case 'standard-user':
              navigate('/report-issue');
              break;
            case 'service-desk-user':
              navigate('/issues');
              break;
            case 'admin-user':
              navigate('/admin');
              break;
            default:
              navigate('/report-issue');
          }
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1 className="login-title">Service Desk AI</h1>
          <p className="login-subtitle">Report issues. Track progress. Stay informed.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={isLoading} aria-label="Sign in">
            Sign In
          </Button>
        </form>

        <div className="login-footer">
          <p>© 2025 Service Desk AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
