import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../services/api';
import {
  FiHome,
  FiPieChart,
  FiDroplet,
  FiActivity,
  FiMoon,
  FiTrendingUp,
  FiTarget,
  FiBarChart2,
  FiCalendar,
  FiBell,
  FiSettings,
  FiLogOut,
  FiZap,
} from 'react-icons/fi';

export default function Sidebar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const res = await notificationApi.getUnreadCount();
        setUnreadCount(res.data.data?.unreadCount || 0);
      } catch (err) {
        // quiet error
      }
    };
    fetchBadge();
    const interval = setInterval(fetchBadge, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/diet', label: 'Diet & Food', icon: FiPieChart },
    { to: '/water', label: 'Water Tracker', icon: FiDroplet },
    { to: '/workout', label: 'Workouts & Live', icon: FiActivity },
    { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
    { to: '/calendar', label: 'Calendar', icon: FiCalendar },
    { to: '/sleep', label: 'Sleep & Recovery', icon: FiMoon },
    { to: '/progress', label: 'Body Progress', icon: FiTrendingUp },
    { to: '/goals', label: 'Goals', icon: FiTarget },
    { to: '/notifications', label: 'Alerts & Prompts', icon: FiBell, badge: unreadCount },
    { to: '/settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.logoIcon}>
          <FiZap size={22} color="#ffffff" />
        </div>
        <div>
          <div style={styles.brandTitle}>FitTrack</div>
          <div style={styles.brandSub}>PRO FITNESS OS</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{
                    ...styles.iconWrapper,
                    color: isActive ? '#6366f1' : '#94a3b8'
                  }}>
                    <Icon size={18} />
                  </span>
                  <span style={styles.linkLabel}>{item.label}</span>
                  {Boolean(item.badge) && item.badge > 0 && (
                    <span style={styles.badge}>{item.badge}</span>
                  )}
                  {isActive && <div style={styles.activePill} />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={styles.userName}>{user?.fullName || 'Athlete'}</div>
            <div style={styles.userEmail}>{user?.email || 'FitTrack User'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          style={styles.logoutBtn}
        >
          <FiLogOut size={17} />
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '260px',
    height: '100vh',
    background: 'linear-gradient(180deg, rgba(14, 20, 35, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.07)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 8px 20px 8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  brandSub: {
    fontSize: '0.62rem',
    fontWeight: '700',
    color: '#818cf8',
    letterSpacing: '0.12em',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '9px 14px',
    borderRadius: '10px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  navLinkActive: {
    background: 'rgba(99, 102, 241, 0.12)',
    color: '#ffffff',
    fontWeight: '600',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  },
  linkLabel: {
    flex: 1,
  },
  badge: {
    background: '#ef4444',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 800,
    padding: '2px 7px',
    borderRadius: '10px',
  },
  activePill: {
    position: 'absolute',
    right: 0,
    top: '20%',
    bottom: '20%',
    width: '3.5px',
    borderRadius: '4px',
    background: 'linear-gradient(180deg, #6366f1, #a855f7)',
    boxShadow: '0 0 10px #6366f1',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 10px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    marginTop: 'auto',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflow: 'hidden',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.88rem',
    color: '#fff',
    flexShrink: 0,
  },
  userName: {
    fontSize: '0.84rem',
    fontWeight: '600',
    color: '#f1f5f9',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.72rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
};
