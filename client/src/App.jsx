import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { InboxPage } from './pages/InboxPage';
import { CustomerPage } from './pages/CustomerPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Public Authentication Routes */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />

              {/* Public Customer Testing Route */}
              <Route path="/customer" element={<CustomerPage />} />

              {/* Protected Agent Routes */}
              <Route
                path="/inbox"
                element={
                  <ProtectedRoute>
                    <InboxPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inbox/:conversationId"
                element={
                  <ProtectedRoute>
                    <InboxPage />
                  </ProtectedRoute>
                }
              />

              {/* Default & Fallback Redirection */}
              <Route path="/" element={<Navigate to="/inbox" replace />} />
              <Route path="*" element={<Navigate to="/inbox" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
