import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import './ProfilePage.css';

interface Office {
  id: string;
  name: string;
  country: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [country, setCountry] = useState(user?.country || '');
  const [office, setOffice] = useState(user?.office || '');
  const [workstation, setWorkstation] = useState(user?.workstation || '');
  
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/standard-user/offices', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setOffices(data);
      }
    } catch (error) {
      console.error('Failed to fetch offices:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/standard-user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, phoneNumber, country, office, workstation }),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Update your personal information</p>

        <form className="profile-form" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
          />

          <div className="form-group">
            <label htmlFor="office">Office Location *</label>
            <select
              id="office"
              value={office}
              onChange={(e) => {
                const selectedOffice = offices.find(o => o.name === e.target.value);
                setOffice(e.target.value);
                if (selectedOffice) {
                  setCountry(selectedOffice.country);
                }
              }}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontFamily: 'inherit',
              }}
            >
              <option value="">Select an office</option>
              {offices.map((off) => (
                <option key={off.id} value={off.name}>
                  {off.name} ({off.country})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            disabled
          />

          <Input
            label="Workstation"
            type="text"
            value={workstation}
            onChange={(e) => setWorkstation(e.target.value)}
            placeholder="e.g., C2R9S3"
          />

          {message && (
            <div className={`profile-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
