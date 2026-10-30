import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Inbox,
  MessageSquare,
  LogOut,
  User as UserIcon,
  Sparkles,
  Shield,
  
} from 'lucide-react';
import { Badge } from '../common/Badge';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isCustomerRoute = location.pathname.startsWith('/customer');

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Left: Brand Identity */}
        <div className="navbar-left">
          <Link to={isAuthenticated ? '/inbox' : '/'} className="navbar-brand">
            <div className="navbar-logo-icon">
              <Sparkles size={18} className="logo-sparkle" />
            </div>
            <div className="navbar-brand-text">
              <span className="brand-name">Datastraw</span>
              <span className="brand-product">Support AI</span>
            </div>
          </Link>
          <span className="navbar-divider" aria-hidden="true">/</span>
          <span className="navbar-env-badge">v1.0 Production Demo</span>
        </div>

        {/* Center: View Switcher (Agent vs Customer View) */}
        <div className="navbar-center">
          <div className="view-toggle-pill" role="navigation" aria-label="Perspective selector">
            <Link
              to="/inbox"
              className={`view-toggle-item ${!isCustomerRoute ? 'active' : ''}`}
            >
              <Inbox size={15} />
              <span>Agent Inbox</span>
              {isAuthenticated && (
                <span className="online-indicator" title="Connected" />
              )}
            </Link>

            <Link
              to="/customer"
              className={`view-toggle-item ${isCustomerRoute ? 'active' : ''}`}
            >
              <MessageSquare size={15} />
              <span>Customer View</span>
              <Badge variant="blue" size="sm" className="toggle-badge">
                Public Test
              </Badge>
            </Link>
          </div>
        </div>

        {/* Right: Auth Profile / Navigation */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-meta">
                <div className="user-avatar-sm">
                  <UserIcon size={14} />
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.name || 'Support Agent'}</span>
                  <div className="user-role-wrap">
                    <Badge variant={user?.role === 'ADMIN' ? 'indigo' : 'gray'} size="sm">
                      {user?.role === 'ADMIN' ? (
                        <Shield size={10} style={{ marginRight: 3 }} />
                      ) : null}
                      {user?.role || 'AGENT'}
                    </Badge>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-logout"
                onClick={logout}
                title="Sign out of agent account"
                aria-label="Sign out"
              >
                <LogOut size={16} />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-nav-links">
              {location.pathname !== '/login' && (
                <Link to="/login" className="nav-login-link">
                  Agent Sign In
                </Link>
              )}
              {/* {location.pathname !== '/register' && (
                <Link to="/register" className="nav-register-btn">
                  <span>Register Agent</span>
                  <ArrowRight size={14} />
                </Link>
              )} */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
