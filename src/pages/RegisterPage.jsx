import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { registerUser } from '../api/authApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import '../styles/pages/auth.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  function validate() {
    const e = {};
    if (!form.username.trim() || form.username.length < 3) e.username = 'Username must be at least 3 characters';
    if (!form.email.trim() || !form.email.includes('@'))   e.email = 'Valid email is required';
    if (!form.password || form.password.length < 6)        e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm)                    e.confirm = 'Passwords do not match';
    return e;
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setServerError('');
    try {
      const data = await registerUser({ username: form.username.trim(), email: form.email.trim(), password: form.password });
      login(data.token, data.user);
      navigate('/verify-email', { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message ?? 'Registration failed. Try again.');
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
          <h2 className="auth-art__headline">Start for free.</h2>
          <p className="auth-art__sub">Join thousands of teams that use Task Desk to stay organized and motivated.</p>
          <div className="auth-art__stats">
            <div className="auth-art__stat"><span>✓</span><span>No credit card required</span></div>
            <div className="auth-art__stat"><span>✓</span><span>Free plan forever</span></div>
            <div className="auth-art__stat"><span>✓</span><span>2-minute setup</span></div>
          </div>
        </div>
        <div className="auth-art__mesh" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="auth-art__mesh-dot" style={{
              left: `${(i * 17 + 5) % 100}%`,
              top:  `${(i * 23 + 10) % 100}%`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }} />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-page__form-panel">
        <div className="auth-form">
          <div className="auth-form__header">
            <h1 className="auth-form__title">Create account</h1>
            <p className="auth-form__sub">
              Already have one? <Link to="/login" className="auth-form__link">Sign in →</Link>
            </p>
          </div>

          {serverError && (
            <div className="auth-form__error-banner" role="alert">{serverError}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form__fields" noValidate>
            <Input
              id="reg-username"
              label="Username"
              type="text"
              placeholder="john_doe"
              value={form.username}
              onChange={handleChange('username')}
              error={errors.username}
              autoComplete="username"
              hint="3–30 characters, used to identify you in plans."
            />
            <Input
              id="reg-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              id="reg-password"
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange('password')}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              id="reg-confirm"
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={handleChange('confirm')}
              error={errors.confirm}
              autoComplete="new-password"
            />

            <Button
              id="register-submit"
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="auth-form__submit"
            >
              Create my account
            </Button>
          </form>

          <p className="auth-form__terms">
            By registering, you agree to our{' '}
            <a href="#terms" className="auth-form__link">Terms</a> and{' '}
            <a href="#privacy" className="auth-form__link">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

