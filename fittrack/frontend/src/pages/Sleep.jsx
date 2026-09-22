import React, { useState, useEffect } from 'react';
import { sleepApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  FiMoon,
  FiClock,
  FiCalendar,
  FiTrash2,
  FiCheckCircle,
} from 'react-icons/fi';

const QUALITIES = [
  { value: 'EXCELLENT', label: 'Excellent', icon: '🌟', color: '#10b981' },
  { value: 'GOOD', label: 'Good', icon: '😊', color: '#6366f1' },
  { value: 'FAIR', label: 'Fair', icon: '😐', color: '#f59e0b' },
  { value: 'POOR', label: 'Poor', icon: '🥱', color: '#f97316' },
  { value: 'TERRIBLE', label: 'Terrible', icon: '😫', color: '#ef4444' },
];

export default function Sleep() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [currentLog, setCurrentLog] = useState(null);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState('GOOD');
  const [notes, setNotes] = useState('');

  const targetHours = profile?.sleepTargetHours ? Number(profile.sleepTargetHours) : 8;

  const fetchSleep = async (date) => {
    setLoading(true);
    try {
      const today = new Date(date);
      const past = new Date(today);
      past.setDate(today.getDate() - 6);

      const fromStr = past.toISOString().split('T')[0];
      const toStr = date;

      const [singleRes, rangeRes] = await Promise.all([
        sleepApi.getByDate(date),
        sleepApi.getRange(fromStr, toStr),
      ]);

      const log = singleRes.data.data;
      setCurrentLog(log);
      if (log) {
        if (log.sleepTime) setBedtime(log.sleepTime.slice(11, 16));
        if (log.wakeTime) setWakeTime(log.wakeTime.slice(11, 16));
        if (log.quality) setQuality(log.quality);
        if (log.notes) setNotes(log.notes);
      } else {
        setNotes('');
      }

      const formatted = (rangeRes.data.data || []).map((l) => ({
        date: l.logDate?.slice(5),
        hours: l.durationMinutes ? Number((l.durationMinutes / 60).toFixed(1)) : 0,
      }));
      setWeeklyLogs(formatted);
    } catch (err) {
      toast.error('Could not load sleep data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleep(selectedDate);
  }, [selectedDate]);

  const handleSaveSleep = async (e) => {
    e.preventDefault();
    try {
      // Build ISO local datetime strings
      const sleepDateTime = `${selectedDate}T${bedtime}:00`;
      const wakeDateTime = `${selectedDate}T${wakeTime}:00`;

      await sleepApi.log({
        logDate: selectedDate,
        sleepTime: sleepDateTime,
        wakeTime: wakeDateTime,
        quality,
        notes,
      });

      toast.success('Sleep logged successfully! 💤');
      fetchSleep(selectedDate);
    } catch (err) {
      toast.error('Could not log sleep entry');
    }
  };

  const handleDelete = async () => {
    if (!currentLog) return;
    try {
      await sleepApi.delete(currentLog.id);
      toast.success('Sleep entry removed');
      fetchSleep(selectedDate);
    } catch (err) {
      toast.error('Could not delete sleep record');
    }
  };

  const currentDurationHrs = currentLog?.durationMinutes
    ? (currentLog.durationMinutes / 60).toFixed(1)
    : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={sleepStyles.headerRow}>
        <div>
          <div style={sleepStyles.subTitle}>RECOVERY & SLEEP HYGIENE</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Sleep Tracker</h1>
        </div>

        <div style={sleepStyles.datePickerContainer}>
          <FiCalendar style={{ color: '#a855f7', fontSize: '18px' }} />
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Main Grid: Form & Chart */}
      <div style={sleepStyles.grid}>
        {/* Sleep Logging Form Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={sleepStyles.moonBadge}>
                <FiMoon size={22} color="#c084fc" />
              </div>
              <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>
                {currentLog ? 'Update Sleep Record' : 'Record Last Night’s Sleep'}
              </h2>
            </div>
            {currentLog && (
              <button
                onClick={handleDelete}
                className="btn btn-danger btn-sm"
                title="Delete Record"
              >
                <FiTrash2 />
              </button>
            )}
          </div>

          <form onSubmit={handleSaveSleep} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Bedtime</label>
                <div style={sleepStyles.timeInputWrapper}>
                  <FiClock style={sleepStyles.inputIcon} />
                  <input
                    type="time"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Wake Time</label>
                <div style={sleepStyles.timeInputWrapper}>
                  <FiClock style={sleepStyles.inputIcon} />
                  <input
                    type="time"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quality Selector */}
            <div>
              <label className="form-label">How well did you sleep?</label>
              <div style={sleepStyles.qualityGrid}>
                {QUALITIES.map((q) => (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => setQuality(q.value)}
                    style={{
                      ...sleepStyles.qualityBtn,
                      ...(quality === q.value
                        ? {
                            background: 'rgba(168, 85, 247, 0.25)',
                            borderColor: '#a855f7',
                            boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)',
                          }
                        : {}),
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{q.icon}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>
                      {q.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Sleep Notes / Dreams / Wake-ups</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Fell asleep quickly, woke up refreshed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <FiCheckCircle /> {currentLog ? 'Save Updates' : 'Log Sleep Session'}
            </button>
          </form>
        </div>

        {/* Sleep Stats & Trend Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sleep duration stat panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Logged Sleep Duration
                </span>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'Outfit', color: '#fff' }}>
                  {currentDurationHrs ? `${currentDurationHrs} hrs` : '--'}
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, marginLeft: '8px' }}>
                    / {targetHours} hrs target
                  </span>
                </div>
              </div>
              {currentLog?.quality && (
                <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                  {currentLog.quality} Quality
                </span>
              )}
            </div>
          </div>

          {/* 7-Day Sleep Chart */}
          <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '4px' }}>
              7-Day Sleep Duration Trend
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
              Reference Target: {targetHours} hours
            </p>

            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyLogs}>
                  <defs>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis stroke="#64748b" domain={[0, 12]} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <ReferenceLine y={targetHours} stroke="#ec4899" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#sleepGrad)"
                    name="Sleep (hrs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sleepStyles = {
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
    color: '#a855f7',
    marginBottom: '4px',
  },
  datePickerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '4px 12px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '24px',
  },
  moonBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(168, 85, 247, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#64748b',
  },
  qualityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
    marginTop: '6px',
  },
  qualityBtn: {
    padding: '10px 4px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
