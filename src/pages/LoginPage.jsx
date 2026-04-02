import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { loginUser, googleLogin } from '../api/authApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import '../styles/pages/auth.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Redirect if already authed
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Google auth-code flow — uses 'postmessage' internally (matches backend OAuth2Client)
  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async ({ code }) => {
      setGoogleLoading(true);
      setServerError('');
      try {
        const data = await googleLogin(code);
        login(data.token, data.user);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setServerError(err?.response?.data?.message ?? 'Google sign-in failed. Try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setServerError('Google sign-in was cancelled or failed.');
    },
  });

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'Email or username is required';
    if (!form.password)     e.password = 'Password is required';
    return e;
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setServerError('');
    try {
      const data = await loginUser({ email: form.email, password: form.password });
      login(data.token, data.user);
      if (!data.user.isEmailVerified && data.user.authSource === 'local') {
        navigate('/verify-email', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setServerError(err?.response?.data?.message ?? 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  }, [form, login, navigate]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="auth-page">
      {/* Left art panel */}
      <div className="auth-page__art" aria-hidden="true">
        <div className="auth-art__glow auth-art__glow--1" />
        <div className="auth-art__glow auth-art__glow--2" />
        <div className="auth-art__content">
          <div className="auth-art__logo">
            <svg width="32" height="32" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#7C3AED" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#7C3AED" opacity="0.6" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#7C3AED" opacity="0.6" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#7C3AED" opacity="0.3" />
            </svg>
            <span className="auth-art__logo-text">Task Desk</span>
          </div>
          <h2 className="auth-art__headline">Welcome back.</h2>
          <p className="auth-art__sub">Your team is waiting. Your streak is counting. Let's go.</p>
          <div className="auth-art__stats">
            <div className="auth-art__stat"><span>🔥</span><span>Keep your streak alive</span></div>
            <div className="auth-art__stat"><span>⚡</span><span>Earn XP every task</span></div>
            <div className="auth-art__stat"><span>👥</span><span>Collaborate in real-time</span></div>
          </div>
        </div>
        <div className="auth-art__mesh" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="auth-art__mesh-dot" style={{
              left: `${Math.random() * 100}%`,
              top:  `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }} />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-page__form-panel">
        <div className="auth-form">
          <div className="auth-form__header">
            <h1 className="auth-form__title">Sign in</h1>
            <p className="auth-form__sub">
              Don't have an account? <Link to="/register" className="auth-form__link">Create one →</Link>
            </p>
          </div>

          {serverError && (
            <div className="auth-form__error-banner" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form__fields" noValidate>
            <Input
              id="login-email"
              label="Email or username"
              type="text"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
              autoComplete="email"
              leftIcon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange('password')}
              error={errors.password}
              autoComplete="current-password"
              leftIcon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              }
            />
            <div className="auth-form__row">
              <Link to="/forgot-password" className="auth-form__forgot">Forgot password?</Link>
            </div>

            <Button
              id="login-submit"
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="auth-form__submit"
            >
              Sign in to Task Desk
            </Button>
          </form>

          <div className="auth-form__divider">
            <span>or continue with</span>
          </div>

          <button
            className="auth-form__google"
            id="google-login-btn"
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <span style={{fontSize:13}}>Signing in...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

