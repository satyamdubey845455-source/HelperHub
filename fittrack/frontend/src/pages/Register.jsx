import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiZap, FiArrowRight } from 'react-icons/fi';
import { authStyles } from './Login';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/settings'); // go directly to profile setup
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authStyles.container}>
      <div className="glass-panel" style={authStyles.card}>
        <div style={authStyles.header}>
          <div style={authStyles.logoBadge}>
            <FiZap size={28} color="#ffffff" />
          </div>
          <h1 style={authStyles.title}>Join FitTrack</h1>
          <p style={authStyles.subtitle}>Start tracking nutrition, workouts, sleep, and PRs today.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={authStyles.inputWrapper}>
              <FiUser style={authStyles.inputIcon} />
              <input
                type="text"
                name="fullName"
                className="form-input"
                style={authStyles.inputWithIcon}
                placeholder="Alex Morgan"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={authStyles.inputWrapper}>
              <FiMail style={authStyles.inputIcon} />
              <input
                type="email"
                name="email"
                className="form-input"
                style={authStyles.inputWithIcon}
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                className="form-input"
                style={authStyles.inputWithIcon}
                placeholder="Min 8 chars, 1 uppercase, 1 digit"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={authStyles.inputWrapper}>
              <FiLock style={authStyles.inputIcon} />
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                style={authStyles.inputWithIcon}
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '13px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Get Started'} <FiArrowRight size={18} />
          </button>
        </form>

        <div style={authStyles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={authStyles.link}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
