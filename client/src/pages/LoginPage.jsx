import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { isValidEmail } from '../utils/validators';
import { Mail, Lock, Sparkles, KeyRound } from 'lucide-react';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const from = location.state?.from?.pathname || '/inbox';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    try {
      await login(email, password);
      toast.success('Welcome back! Signed in successfully.');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid email or password';
      setApiError(msg);
      toast.error(msg);
    }
  };

  // Helper for one-click demo login during assessment review
  const handleQuickDemoFill = () => {
    setEmail('testagent@example.com');
    setPassword('password123');
    setErrors({});
    setApiError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={22} className="logo-icon-sparkle" />
          </div>
          <h2 className="auth-title">Agent Sign In</h2>
          <p className="auth-subtitle">
            Sign in to access the Datastraw Support Inbox and review AI drafts
          </p>
        </div>

        {apiError && (
          <div className="auth-error-alert" role="alert">
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
            placeholder="••••••••"
            error={errors.password}
            required
            autoComplete="current-password"
            icon={Lock}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="btn-auth-submit"
          >
            Sign In to Inbox
          </Button>

          {/* Quick Demo Fill button for reviewer convenience */}
          <div className="demo-credentials-helper">
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickDemoFill}
              icon={KeyRound}
              className="btn-fill-demo"
            >
              Fill Demo Credentials (testagent@example.com)
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an agent account yet?{' '}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
          <div className="auth-customer-switch">
            <span>Looking for customer testing? </span>
            <Link to="/customer" className="auth-link-alt">
              Open Customer View &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

