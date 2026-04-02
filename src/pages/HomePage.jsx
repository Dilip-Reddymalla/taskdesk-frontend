import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/pages/home.css';

const FEATURES = [
  { icon: '⚡', title: 'Real-time Sync', desc: 'See every task update instantly across all team members via WebSockets.' },
  { icon: '📅', title: 'Calendar View', desc: 'Visualize all tasks in monthly, weekly, and daily layouts. Drag to reschedule.' },
  { icon: '🔥', title: 'Streak System', desc: 'Build daily completion streaks and stay on track with your goals.' },
  { icon: '🏆', title: 'XP & Levels', desc: 'Earn XP for every task you complete. Level up and unlock badges.' },
  { icon: '🔔', title: 'Smart Notifications', desc: 'Never miss an assignment, update, or invite with real-time alerts.' },
  { icon: '↕️', title: 'Drag & Drop', desc: 'Reorganize tasks across dates with fluid drag-and-drop scheduling.' },
  { icon: '✉️', title: 'Invite System', desc: 'Invite teammates by username. Accept or decline from notifications.' },
  { icon: '🚨', title: 'Priority Tasks', desc: 'Mark tasks as High, Medium, or Low priority. Focus on what matters.' },
  { icon: '📱', title: 'PWA Support', desc: 'Install Task Desk on any device. Works offline with cached data.' },
  { icon: '🖼️', title: 'Image Proof', desc: 'Upload photos as proof of task completion for team accountability.' },
  { icon: '👥', title: 'Plan Collaboration', desc: 'Create shared workspaces for your team. Everyone stays in sync.' },
  { icon: '🛡️', title: 'Role Permissions', desc: 'Owners control membership. Assign tasks to specific members.' },
];

const FEATURE_HIGHLIGHTS = [
  { 
    initials: '🔥', 
    name: 'The Streak System', 
    text: 'Consistency is key. Every day you complete a task, your streak grows. It’s a simple but powerful visual nudge to keep going.' 
  },
  { 
    initials: '⚡', 
    name: 'Gamified Rewards', 
    text: 'Earn XP for every finished task. Watch your level rise as you get through your to-do list. Productivity has never felt more rewarding.' 
  },
  { 
    initials: '👥', 
    name: 'Seamless Team Sync', 
    text: 'Real-time updates ensure everyone stays on the same page. No more manual status updates—just share a plan and collaborate.' 
  },
];

function AnimatedXP() {
  const [xp, setXp] = useState(1240);
  const interval = useRef(null);
  return (
    <span
      className="home-gam__xp"
      onMouseEnter={() => {
        interval.current = setInterval(() => setXp(v => v + 10), 120);
      }}
      onMouseLeave={() => {
        clearInterval(interval.current);
      }}
    >
      ⚡ {xp.toLocaleString()} XP
    </span>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="home">
      {/* ── NAVBAR ── */}
      <nav className={`home-nav ${scrolled ? 'home-nav--scrolled' : ''}`}>
        <div className="home-nav__logo">
          <div className="home-nav__logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="var(--accent)" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.6" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.6" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.3" />
            </svg>
          </div>
          <span className="home-nav__logo-text">Task Desk</span>
        </div>
        <div className="home-nav__links">
          <a href="#features" className="home-nav__link">Features</a>
          <a href="#how-it-works" className="home-nav__link">How it works</a>
          <a href="#gamification" className="home-nav__link">Gamification</a>
          <Link to="/login" className="home-nav__link">Login</Link>
          <button 
            className="home-nav__theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <Link to="/register" className="home-nav__cta">Get started free</Link>
        <div className="home-nav__mobile-right">
          <button 
            className="home-nav__theme-toggle home-nav__theme-toggle--mobile" 
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="home-nav__mobile-cta" onClick={() => navigate('/register')}>Start free</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="home-hero__glow" aria-hidden="true" />
        <div className="home-hero__inner">
          <div className="home-hero__pill">
            ✦ Real-time collaboration
          </div>
          <h1 className="home-hero__h1">
            Plan smarter.<br />
            <span className="home-hero__gradient">Ship faster. Together.</span>
          </h1>
          <p className="home-hero__sub">
            Task Desk is the collaborative task manager built for teams that care about momentum.
            Assign tasks, track streaks, earn XP, and ship — all in one place.
          </p>
          <div className="home-hero__ctas">
            <Link to="/register" className="home-hero__cta-primary">Start for free →</Link>
            <a href="#how-it-works" className="home-hero__cta-ghost">See how it works</a>
          </div>
          <div className="home-hero__trust">
            <span>✓ No credit card</span>
            <span>✓ Free forever</span>
            <span>✓ 2-minute setup</span>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="home-hero__mockup-wrap">
          <div className="home-hero__mockup" aria-hidden="true">
            <div className="mockup__header">
              <div className="mockup__dot mockup__dot--red" />
              <div className="mockup__dot mockup__dot--amber" />
              <div className="mockup__dot mockup__dot--green" />
              <span className="mockup__title">Task Desk — Dashboard</span>
            </div>
            <div className="mockup__body">
              <div className="mockup__stats">
                <div className="mockup__stat">
                  <span className="mockup__stat-val" style={{color:'var(--accent-light)'}}>12</span>
                  <span className="mockup__stat-label">Tasks Today</span>
                </div>
                <div className="mockup__stat">
                  <span className="mockup__stat-val" style={{color:'var(--amber)'}}>🔥 7</span>
                  <span className="mockup__stat-label">Day Streak</span>
                </div>
                <div className="mockup__stat">
                  <span className="mockup__stat-val" style={{color:'var(--green)'}}>⚡ 1,240</span>
                  <span className="mockup__stat-label">Total XP</span>
                </div>
              </div>
              <div className="mockup__tasks">
                {['Fix authentication bug', 'Design onboarding flow', 'Write API tests'].map((t, i) => (
                  <div className="mockup__task" key={i}>
                    <div className={`mockup__task-check ${i === 0 ? 'mockup__task-check--done' : ''}`} />
                    <span className="mockup__task-title">{t}</span>
                    <span className={`mockup__task-badge mockup__task-badge--${['red','amber','green'][i]}`}>
                      {['High','Med','Low'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="home-features" id="features">
        <div className="home-section-header">
          <p className="home-section-eyebrow">Packed with power</p>
          <h2 className="home-section-title">Everything your team needs</h2>
        </div>
        <div className="home-features__grid">
          {FEATURES.map((f, i) => (
            <div className="home-feature-card" key={i}>
              <div className="home-feature-card__icon">{f.icon}</div>
              <h4 className="home-feature-card__title">{f.title}</h4>
              <p className="home-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="home-how" id="how-it-works">
        <div className="home-section-header">
          <p className="home-section-eyebrow">Simple by design</p>
          <h2 className="home-section-title">Up and running in minutes</h2>
        </div>
        <div className="home-how__steps">
          {[
            { num: '01', title: 'Create a plan & invite your team', desc: 'Set up a shared workspace in seconds. Invite teammates by username.' },
            { num: '02', title: 'Assign tasks with priorities', desc: 'Add tasks with deadlines, priorities, and assign them to team members.' },
            { num: '03', title: 'Complete tasks & earn rewards', desc: 'Mark tasks done, earn +10 XP each time, and keep your daily streak alive.' },
          ].map((step, i) => (
            <div className="home-how__step" key={i}>
              <span className="home-how__num">{step.num}</span>
              <h4 className="home-how__title">{step.title}</h4>
              <p className="home-how__desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GAMIFICATION TEASER ── */}
      <section className="home-gam" id="gamification">
        <div className="home-gam__card">
          <div className="home-gam__badges-row">
            <div className="home-gam__badge-pill">🏅 Level 7 — Champion</div>
            <div className="home-gam__badge-pill home-gam__badge-pill--amber">🔥 14-day streak</div>
          </div>
          <h2 className="home-gam__title">Work feels different<br />when it's a game.</h2>
          <p className="home-gam__sub">
            Every completed task earns XP. Build streaks. Hit milestones. 
            Unlock badges. Your dashboard becomes a leaderboard of progress.
          </p>
          <div className="home-gam__metrics">
            <AnimatedXP />
            <span className="home-gam__xp-bar-wrap">
              <span className="home-gam__xp-bar-fill" />
            </span>
            <span className="home-gam__level">Level 8 in 260 XP</span>
          </div>
          <Link to="/register" className="home-hero__cta-primary">Start earning XP today</Link>
        </div>
      </section>

      {/* ── FEATURES FOCUS (FORMERLY TESTIMONIALS) ── */}
      <section className="home-testimonials">
        <div className="home-section-header">
          <p className="home-section-eyebrow">Powered by Focus</p>
          <h2 className="home-section-title">Built for consistency</h2>
        </div>
        <div className="home-testimonials__grid">
          {FEATURE_HIGHLIGHTS.map((f, i) => (
            <div className="home-testimonial-card" key={i}>
              <div className="home-testimonial-card__author" style={{ marginBottom: '16px' }}>
                <div className="home-testimonial-card__avatar" style={{ fontSize: '20px' }}>{f.initials}</div>
                <div>
                  <p className="home-testimonial-card__name" style={{ fontSize: '15px' }}>{f.name}</p>
                </div>
              </div>
              <p className="home-testimonial-card__text" style={{ fontStyle: 'normal' }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="home-footer__logo">
          <div className="home-nav__logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="var(--accent)" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.6" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.6" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.3" />
            </svg>
          </div>
          <span className="home-nav__logo-text" style={{fontSize:'15px'}}>Task Desk</span>
        </div>
        <p className="home-footer__tagline">Collaborative task management for modern teams.</p>
        <div className="home-footer__links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
        <p className="home-footer__credit">Made with intention · Task Desk © 2026</p>
      </footer>
    </div>
  );
}

export default HomePage;

