import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../components/Button';
import './ReportIssuePage.css';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Date;
}

export function ReportIssuePage() {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Capture geolocation on component mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLocationStatus('Detecting location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          };
          setLocation(loc);
          setLocationStatus(`✓ Location captured (±${Math.round(loc.accuracy || 0)}m)`);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationStatus('Location unavailable');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('Geolocation not supported');
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    // Reset the file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }
    if (location) {
      formData.append('location', JSON.stringify(location));
    }

    try {
      const response = await fetch('http://localhost:3000/api/issues', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setMessage('Issue reported successfully!');
        setDescription('');
        setImage(null);
        setImagePreview('');
      } else {
        setMessage('Failed to report issue');
      }
    } catch (error) {
      setMessage('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-card">
        <h1 className="report-title">Report an Issue</h1>
        <p className="report-subtitle">Describe the problem and upload a photo</p>

        <form className="report-form" onSubmit={handleSubmit}>
          {locationStatus && (
            <div className="location-status" style={{ 
              padding: '0.75rem',
              backgroundColor: location ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)',
              border: `1px solid ${location ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`,
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: location ? '#4ade80' : '#fbbf24',
              marginBottom: '1rem'
            }}>
              {locationStatus}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Issue Description
            </label>
            <textarea
              id="description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={5}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image" className="form-label">
              Upload Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-file-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="remove-image-btn"
                  aria-label="Remove image"
                >
                  ✕ Remove
                </button>
              </div>
            )}
          </div>

          {message && (
            <div className={`report-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <Button type="submit" isLoading={isLoading}>
            Submit Issue
          </Button>
        </form>
      </div>
    </div>
  );
}
