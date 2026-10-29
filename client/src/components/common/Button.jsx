import { Loader2 } from 'lucide-react';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon = null,
  onClick,
  className = '',
  title,
  ...props
}) {
  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const loadingClass = isLoading ? 'btn-loading' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${loadingClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      onClick={onClick}
      title={title}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="btn-spinner" size={size === 'sm' ? 14 : 16} />
      ) : Icon ? (
        <Icon className="btn-icon" size={size === 'sm' ? 14 : 16} />
      ) : null}
      <span className="btn-text">{children}</span>
    </button>
  );
}

