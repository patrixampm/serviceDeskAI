import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import './ProfilePage.css';

export function ProfilePage() {
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [country, setCountry] = useState(user?.country || '');
  const [office, setOffice] = useState('');
  const [workstation, setWorkstation] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

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

          <Input
            label="Country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />

          <Input
            label="Office Location"
            type="text"
            value={office}
            onChange={(e) => setOffice(e.target.value)}
            placeholder="e.g., Malaga Office"
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
