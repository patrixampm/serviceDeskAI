import { useState, FormEvent } from 'react';
import { Button } from '../components/Button';
import './ReportIssuePage.css';

export function ReportIssuePage() {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

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
