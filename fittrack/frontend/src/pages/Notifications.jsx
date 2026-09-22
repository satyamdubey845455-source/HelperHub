import React, { useState, useEffect } from 'react';
import { notificationApi, reminderApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiTrash2,
  FiDroplet,
  FiActivity,
  FiPieChart,
  FiTarget,
  FiMoon,
  FiInfo,
  FiX,
} from 'react-icons/fi';

const NOTIFICATION_CATEGORIES = [
  'ALL',
  'HYDRATION',
  'WORKOUT',
  'NUTRITION',
  'GOAL',
  'SLEEP',
  'SYSTEM',
];

const REMINDER_TYPES = [
  'HYDRATION',
  'WORKOUT',
  'MEAL',
  'SLEEP',
  'GOAL',
  'CUSTOM',
];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications', 'reminders'
  const [notifications, setNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Reminders
  const [reminders, setReminders] = useState([]);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    reminderType: 'HYDRATION',
    scheduledTime: '14:00',
    message: 'Drink 500ml water to stay energized!',
  });

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await reminderApi.getAll();
      setReminders(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchNotifications(), fetchReminders()]).finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error('Could not mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      toast.success('All notifications marked as read! ✨');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      toast.error('Could not mark all as read');
    }
  };

  const handleToggleReminder = async (id) => {
    try {
      const res = await reminderApi.toggle(id);
      const updated = res.data.data;
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isEnabled: updated.isEnabled } : r))
      );
      toast.success(updated.isEnabled ? 'Reminder enabled 🔔' : 'Reminder muted 🔕');
    } catch (err) {
      toast.error('Could not toggle reminder');
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await reminderApi.delete(id);
      toast.success('Reminder removed');
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error('Could not delete reminder');
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      await reminderApi.create({
        ...reminderForm,
        isEnabled: true,
      });
      toast.success('New daily reminder created! ⏰');
      setShowAddReminderModal(false);
      fetchReminders();
    } catch (err) {
      toast.error('Could not create reminder');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'HYDRATION': return <FiDroplet style={{ color: '#38bdf8' }} />;
      case 'WORKOUT': return <FiActivity style={{ color: '#10b981' }} />;
      case 'NUTRITION': return <FiPieChart style={{ color: '#fb923c' }} />;
      case 'GOAL': return <FiTarget style={{ color: '#f59e0b' }} />;
      case 'SLEEP': return <FiMoon style={{ color: '#a855f7' }} />;
      default: return <FiInfo style={{ color: '#6366f1' }} />;
    }
  };

  const filteredNotifications = selectedCategory === 'ALL'
    ? notifications
    : notifications.filter((n) => n.category === selectedCategory);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={notifStyles.headerRow}>
        <div>
          <div style={notifStyles.subTitle}>ALERTS & SCHEDULED PROMPTS</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Notification & Reminder Center</h1>
        </div>

        {activeTab === 'notifications' && unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            <FiCheckCircle /> Mark All Read ({unreadCount})
          </button>
        )}

        {activeTab === 'reminders' && (
          <button onClick={() => setShowAddReminderModal(true)} className="btn btn-primary btn-sm">
            <FiPlus /> New Reminder
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={notifStyles.tabRow}>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{ ...notifStyles.tabBtn, ...(activeTab === 'notifications' ? notifStyles.tabBtnActive : {}) }}
        >
          <FiBell /> Notification Inbox {unreadCount > 0 && <span style={notifStyles.badge}>{unreadCount}</span>}
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          style={{ ...notifStyles.tabBtn, ...(activeTab === 'reminders' ? notifStyles.tabBtnActive : {}) }}
        >
          <FiClock /> Daily Reminders ({reminders.length})
        </button>
      </div>

      {/* TAB 1: NOTIFICATIONS INBOX */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Category Filter Pills */}
          <div style={notifStyles.categoryFilterRow}>
            {NOTIFICATION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...notifStyles.catBtn,
                  ...(selectedCategory === cat ? notifStyles.catBtnActive : {}),
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
              <FiBell size={40} style={{ color: '#64748b', marginBottom: '12px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '6px' }}>
                All Caught Up!
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                You have no notifications in this category right now.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className="glass-panel"
                  style={{
                    ...notifStyles.notificationCard,
                    ...(!n.isRead ? notifStyles.unreadCard : {}),
                  }}
                >
                  <div style={notifStyles.iconBox}>
                    {getCategoryIcon(n.category)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{n.title}</strong>
                      {!n.isRead && <span style={notifStyles.newPill}>NEW</span>}
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 'auto' }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
                      {n.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REMINDER MANAGER */}
      {activeTab === 'reminders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reminders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
              <FiClock size={40} style={{ color: '#64748b', marginBottom: '12px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '6px' }}>
                No Active Reminders
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
                Set personalized reminders for water, workout, meals, or sleep schedule.
              </p>
              <button onClick={() => setShowAddReminderModal(true)} className="btn btn-primary">
                <FiPlus /> Create First Reminder
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reminders.map((r) => (
                <div key={r.id} className="glass-panel" style={notifStyles.reminderCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={notifStyles.timeDisplay}>
                      {r.scheduledTime || '12:00'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{r.reminderType}</strong>
                        <span style={{ ...notifStyles.statusBadge, background: r.isEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)', color: r.isEnabled ? '#10b981' : '#64748b' }}>
                          {r.isEnabled ? 'Active' : 'Muted'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '4px' }}>
                        {r.message}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleToggleReminder(r.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      {r.isEnabled ? 'Mute' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(r.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                      title="Delete Reminder"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div style={notifStyles.modalOverlay}>
          <div className="glass-panel" style={notifStyles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>Create Daily Reminder</h2>
              <button onClick={() => setShowAddReminderModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateReminder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={reminderForm.reminderType}
                  onChange={(e) => setReminderForm({ ...reminderForm, reminderType: e.target.value })}
                >
                  {REMINDER_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Scheduled Time (24h)</label>
                <input
                  type="time"
                  className="form-input"
                  value={reminderForm.scheduledTime}
                  onChange={(e) => setReminderForm({ ...reminderForm, scheduledTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message Prompt</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Time to hydrate! 500ml water remaining"
                  value={reminderForm.message}
                  onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddReminderModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FiCheck /> Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const notifStyles = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  subTitle: {
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: '#818cf8',
    marginBottom: '4px',
  },
  tabRow: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '10px',
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#fff',
  },
  badge: {
    background: '#ef4444',
    color: '#fff',
    fontSize: '0.72rem',
    padding: '2px 6px',
    borderRadius: '10px',
    fontWeight: 700,
  },
  categoryFilterRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  catBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#94a3b8',
    padding: '5px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  catBtnActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
    color: '#fff',
  },
  notificationCard: {
    display: 'flex',
    gap: '16px',
    padding: '16px 20px',
    alignItems: 'flex-start',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  unreadCard: {
    borderLeft: '4px solid #6366f1',
    background: 'rgba(99, 102, 241, 0.05)',
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  newPill: {
    fontSize: '0.65rem',
    fontWeight: 800,
    background: '#6366f1',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  reminderCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
  },
  timeDisplay: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#fff',
    fontFamily: 'monospace',
    minWidth: '65px',
  },
  statusBadge: {
    fontSize: '0.7rem',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: 600,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '28px',
  },
};
