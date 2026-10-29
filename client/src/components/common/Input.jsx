export function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  icon: Icon = null,
  className = '',
  autoComplete,
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required-star" aria-hidden="true">*</span>}
        </label>
      )}
      <div className={`input-wrapper ${Icon ? 'with-icon' : ''}`}>
        {Icon && <Icon className="input-icon" size={16} />}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className="form-input"
          {...props}
        />
      </div>
      {error && (
        <span id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="form-helper">
          {helperText}
        </span>
      )}
    </div>
  );
}

