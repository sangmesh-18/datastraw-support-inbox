import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { isValidEmail, isValidPassword } from '../utils/validators';
import { User, Mail, Lock, Sparkles } from 'lucide-react';

export function RegisterPage() {
  const { register, login, isLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full name is required';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    try {
      await register(name, email, password);
      toast.success('Registration successful! Signing you in...');

      // Automatically sign in upon registration
      try {
        await login(email, password);
        navigate('/inbox', { replace: true });
      } catch {
        navigate('/login');
      }
    } catch (err) {
      const msg = err.message || 'Registration failed';
      setApiError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={22} className="logo-icon-sparkle" />
          </div>
          <h2 className="auth-title">Create Agent Account</h2>
          <p className="auth-subtitle">
            Join the support team to review, edit, and approve AI customer replies
          </p>
        </div>

        {apiError && (
          <div className="auth-error-alert" role="alert">
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            id="name"
            name="name"
            label="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Sarah Jenkins"
            error={errors.name}
            required
            autoComplete="name"
            icon={User}
          />

          <Input
            id="email"
            name="email"
            label="Work Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="agent@example.com"
            error={errors.email}
            required
            autoComplete="email"
            icon={Mail}
          />

          <Input
            id="password"
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            placeholder="At least 8 characters"
            helperText="Minimum 8 characters"
            error={errors.password}
            required
            autoComplete="new-password"
            icon={Lock}
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
            }}
            placeholder="Repeat password"
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
            icon={Lock}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="btn-auth-submit"
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an agent account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

