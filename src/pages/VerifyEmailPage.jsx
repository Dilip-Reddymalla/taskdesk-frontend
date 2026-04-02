import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { verifyEmail, resendVerification } from '../api/authApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import '../styles/pages/auth.css';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // If already verified, kick them back to dashboard (unless forced)
  useEffect(() => {
    if (user?.isEmailVerified) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Handle countdown for resend button
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await verifyEmail({ userId: user._id, code: code.trim() });
      updateUser({ isEmailVerified: true });
      addToast('Email verified successfully! 🎉', 'success');
      
      const from = searchParams.get('from');
      if (from === 'profile') navigate('/profile', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Verification failed. Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }, [code, user, updateUser, navigate, addToast, searchParams]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await resendVerification(user._id);
      addToast('A new verification code has been sent to your email.', 'success');
      setCooldown(60); // 1-minute cooldown
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  }, [user, cooldown, addToast]);

  const handleVerifyLater = useCallback(() => {
    const from = searchParams.get('from');
    if (from === 'profile') navigate('/profile', { replace: true });
    else navigate('/dashboard', { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="auth-page auth-page--verify">
      <div className="auth-verify" style={{ maxWidth: 460 }}>
        <div className="auth-verify__icon">📧</div>
        <h2 className="auth-verify__title">Verify your email</h2>
        <p className="auth-verify__sub">
          We sent a 6-digit code to <strong>{user?.email}</strong>.
          Enter the code below to fully activate your account.
        </p>

        {error && (
          <div className="auth-form__error-banner" role="alert" style={{ marginTop: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 24, alignSelf: 'stretch' }}>
          <Input
            id="verification-code"
            type="text"
            label="Verification Code"
            placeholder="123456"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            maxLength={6}
            style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.2rem', fontWeight: 600 }}
          />
          <div className="auth-verify__actions" style={{ flexDirection: 'column', gap: 12, marginTop: 24 }}>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              Verify Code
            </Button>
            
            <Button
              variant="ghost"
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              style={{ width: '100%', color: 'var(--text-secondary)' }}
            >
              {resending ? 'Sending...' : cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
            </Button>

            <Button
              variant="ghost"
              type="button"
              onClick={handleVerifyLater}
              style={{ width: '100%', color: 'var(--text-muted)', fontSize: 13 }}
            >
              Skip and verify later
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
