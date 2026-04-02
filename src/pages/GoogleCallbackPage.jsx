import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { googleLogin } from '../api/authApi';
import { PageLoader } from '../components/ui/Loader';
import '../styles/pages/auth.css';

/**
 * Handles the Google OAuth redirect.
 * Google redirects here with ?code=... after the user grants permission.
 * We forward the code to our backend and exchange it for a JWT.
 */
function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError('Google sign-in was cancelled.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!code) {
      setError('No authorization code received from Google.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    (async () => {
      try {
        const data = await googleLogin(code);
        login(data.token, data.user);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(err?.response?.data?.message ?? 'Google sign-in failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="auth-page auth-page--verify">
        <div className="auth-verify">
          <div className="auth-verify__icon">❌</div>
          <h2 className="auth-verify__title">Sign-in failed</h2>
          <p className="auth-verify__sub">{error}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return <PageLoader />;
}

export default GoogleCallbackPage;
