import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-group">
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      <input
        id={inputId}
        className="form-input"
        aria-label={label}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && (
        <span className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
