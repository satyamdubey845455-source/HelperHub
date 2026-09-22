import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiZap, FiArrowRight } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in both email and password');
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back to FitTrack!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('satya@fittrack.com');
    setPassword('Test@1234');
  };

  return (
    <div style={authStyles.container}>
      <div className="glass-panel" style={authStyles.card}>
        <div style={authStyles.header}>
          <div style={authStyles.logoBadge}>
            <FiZap size={28} color="#ffffff" />
          </div>
          <h1 style={authStyles.title}>FitTrack Pro</h1>
          <p style={authStyles.subtitle}>Welcome back! Sign in to continue your fitness journey.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={authStyles.inputWrapper}>
              <FiMail style={authStyles.inputIcon} />
              <input
                type="email"
                className="form-input"
                style={authStyles.inputWithIcon}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={authStyles.inputWrapper}>
              <FiLock style={authStyles.inputIcon} />
              <input
                type="password"
                className="form-input"
                style={authStyles.inputWithIcon}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '13px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'} <FiArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={fillDemo}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', opacity: 0.85 }}
          >
            ⚡ Quick Fill Test Account
          </button>
        </div>

        <div style={authStyles.footer}>
          Don't have an account yet?{' '}
          <Link to="/register" style={authStyles.link}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}

export const authStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px 36px',
    borderRadius: '24px',
    background: 'rgba(15, 22, 38, 0.75)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(99, 102, 241, 0.15)',
  },
  header: {
    textAlign: 'center',
  },
  logoBadge: {
    width: '54px',
    height: '54px',
    margin: '0 auto 16px auto',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    marginTop: '6px',
    lineHeight: 1.4,
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#64748b',
    fontSize: '17px',
  },
  inputWithIcon: {
    paddingLeft: '42px',
  },
  footer: {
    marginTop: '28px',
    textAlign: 'center',
    fontSize: '0.88rem',
    color: '#94a3b8',
  },
  link: {
    color: '#818cf8',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
