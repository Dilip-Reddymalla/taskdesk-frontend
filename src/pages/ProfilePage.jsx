import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getUserProfile } from '../api/userApi';
import { deleteAccount } from '../api/authApi';
import { getLevel, getLevelTitle, xpProgress, xpToNextLevel, xpInCurrentLevel, xpLevelSpan } from '../utils/xp';
import { formatDate } from '../utils/date';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { CardSkeleton } from '../components/ui/Loader';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/profile.css';

function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate    = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserProfile();
        setProfile(data.user ?? data);
        updateUser(data.user ?? data);
      } catch { /* use auth context user as fallback */ }
      finally { setLoading(false); }
    })();
  }, []);

  const displayUser = profile ?? user;
  const level     = getLevel(displayUser?.xp ?? 0);
  const levelTitle = getLevelTitle(displayUser?.xp ?? 0);
  const progress  = xpProgress(displayUser?.xp ?? 0);
  const xpInLevel = xpInCurrentLevel(displayUser?.xp ?? 0);
  const xpSpan    = xpLevelSpan();

  const handleDeleteAccount = useCallback(async (e) => {
    e.preventDefault();
    if (!deletePassword) { setDeleteError('Password is required to confirm deletion'); return; }
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err?.response?.data?.message ?? 'Incorrect password');
    } finally { setDeleteLoading(false); }
  }, [deletePassword, logout, navigate]);

  if (loading) {
    return <div className="profile-page page-container"><CardSkeleton /></div>;
  }

  const streak        = displayUser?.streakCount ?? 0;
  const totalComplete = displayUser?.tasksCompleted ?? 0;
  const joinedDate    = displayUser?.createdAt ? formatDate(displayUser.createdAt) : '—';

  return (
    <div className="profile-page page-container">
      {/* Hero section */}
      <div className="profile-hero card">
        <div className="profile-hero__bg" aria-hidden="true" />
        <Avatar username={displayUser?.username ?? ''} size="xl" className="profile-hero__avatar" />
        <div className="profile-hero__info">
          <h1 className="profile-hero__name">{displayUser?.username}</h1>
          <p className="profile-hero__email">{displayUser?.email}</p>
          <div className="profile-hero__badges">
            <Badge color="accent">Lv.{level} — {levelTitle}</Badge>
            {streak > 0 && <Badge color="amber">🔥 {streak}-day streak</Badge>}
            {!displayUser?.isEmailVerified && (
              <Badge
                color="red"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/verify-email?from=profile')}
                title="Click to verify your email"
              >
                Email unverified ⭢
              </Badge>
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div className="profile-xp">
          <div className="profile-xp__label">
            <span>⚡ {(displayUser?.xp ?? 0).toLocaleString()} XP</span>
            <span className="profile-xp__next">{xpToNextLevel(displayUser?.xp ?? 0)} to Level {level + 1}</span>
          </div>
          <div className="profile-xp__track">
            <div className="profile-xp__fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="profile-xp__sublabel">{xpInLevel} / {xpSpan} XP in this level</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="profile-stats">
        <div className="profile-stat-card">
          <p className="profile-stat-card__value">{(displayUser?.xp ?? 0).toLocaleString()}</p>
          <p className="profile-stat-card__label">Total XP</p>
        </div>
        <div className="profile-stat-card">
          <p className="profile-stat-card__value profile-stat-card__value--amber">🔥 {streak}</p>
          <p className="profile-stat-card__label">Current Streak</p>
        </div>
        <div className="profile-stat-card">
          <p className="profile-stat-card__value profile-stat-card__value--green">{totalComplete}</p>
          <p className="profile-stat-card__label">Tasks Completed</p>
        </div>
        <div className="profile-stat-card">
          <p className="profile-stat-card__value">Lv.{level}</p>
          <p className="profile-stat-card__label">Current Level</p>
        </div>
      </div>

      {/* Account info */}
      <div className="profile-section card">
        <h3 className="profile-section__title">Account</h3>
        <div className="profile-info-rows">
          <div className="profile-info-row">
            <span className="profile-info-row__label">Username</span>
            <span className="profile-info-row__value">@{displayUser?.username}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-row__label">Email</span>
            <span className="profile-info-row__value">
              {displayUser?.email}
              {displayUser?.isEmailVerified
                ? <Badge color="green" className="profile-verified-badge">✓ Verified</Badge>
                : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate('/verify-email?from=profile')}
                    style={{ color: 'var(--red)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', height: 24, fontSize: 12 }}
                  >
                    Verify Now
                  </Button>
                )
              }
            </span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-row__label">Joined</span>
            <span className="profile-info-row__value">{joinedDate}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-row__label">Auth</span>
            <span className="profile-info-row__value">{displayUser?.googleId ? 'Google OAuth' : 'Email & Password'}</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="profile-danger card">
        <h3 className="profile-danger__title">Danger Zone</h3>
        <p className="profile-danger__desc">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button
          variant="danger"
          id="delete-account-btn"
          onClick={() => setDeleteOpen(true)}
        >
          Delete My Account
        </Button>
      </div>

      {/* Delete confirm modal */}
      <Modal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteError(''); setDeletePassword(''); }} title="Delete Account" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
          All your data — tasks, plans, XP, streaks — will be permanently deleted. Enter your password to confirm.
        </p>
        <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {deleteError && <div className="auth-form__error-banner">{deleteError}</div>}
          <Input
            id="delete-account-password"
            label="Your password"
            type="password"
            placeholder="••••••••"
            value={deletePassword}
            onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button type="submit" variant="danger" loading={deleteLoading}>Permanently delete</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProfilePage;

