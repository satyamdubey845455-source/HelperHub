import React, { useState, useEffect } from 'react';
import { waterApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  FiDroplet,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiAward,
} from 'react-icons/fi';

const QUICK_AMOUNTS = [
  { label: 'Small Glass', ml: 150, icon: '🥛' },
  { label: 'Standard Glass', ml: 250, icon: '🥤' },
  { label: 'Water Bottle', ml: 500, icon: '🍶' },
  { label: 'Large Flask', ml: 750, icon: '🚰' },
  { label: 'Hydration Jug', ml: 1000, icon: '🧊' },
];

export default function Water() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [logs, setLogs] = useState([]);
  const [totalMl, setTotalMl] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const targetMl = profile?.waterTargetMl || 2500;
  const progressPercent = Math.min(100, Math.round((totalMl / (targetMl || 1)) * 100));

  const fetchWater = async (date) => {
    setLoading(true);
    try {
      const [resDate, resWeekly] = await Promise.all([
        waterApi.get(date),
        waterApi.weekly(),
      ]);

      setLogs(resDate.data.data?.logs || []);
      setTotalMl(resDate.data.data?.totalMl || 0);

      // format weekly array
      const rawWeekly = resWeekly.data.data || [];
      const formattedWeekly = rawWeekly.map((row) => ({
        date: String(row[0]).slice(5),
        amount: Number(row[1]) || 0,
      }));
      setWeeklyData(formattedWeekly);
    } catch (err) {
      toast.error('Failed to load water data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWater(selectedDate);
  }, [selectedDate]);

  const handleAddWater = async (ml) => {
    if (!ml || ml <= 0) return;
    try {
      await waterApi.log({ amountMl: Number(ml), logDate: selectedDate });
      toast.success(`+${ml} ml logged! Keep hydrating! 💧`);
      setCustomAmount('');
      fetchWater(selectedDate);
    } catch (err) {
      toast.error('Could not log water');
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await waterApi.delete(id);
      toast.success('Log entry removed');
      fetchWater(selectedDate);
    } catch (err) {
      toast.error('Could not delete log');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={waterStyles.headerRow}>
        <div>
          <div style={waterStyles.subTitle}>HYDRATION ENGINE</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Daily Water Tracker</h1>
        </div>

        <div style={waterStyles.datePickerContainer}>
          <FiCalendar style={{ color: '#06b6d4', fontSize: '18px' }} />
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Hero Hydration Progress Meter */}
      <div className="glass-panel" style={waterStyles.heroPanel}>
        <div style={waterStyles.heroContent}>
          <div style={waterStyles.waterCircleOuter}>
            <div
              style={{
                ...waterStyles.waterCircleInner,
                height: `${progressPercent}%`,
              }}
            />
            <div style={waterStyles.waterCircleText}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'Outfit' }}>
                {progressPercent}%
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>OF GOAL</span>
            </div>
          </div>

          <div style={waterStyles.heroStats}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={waterStyles.dropletIconBadge}>
                <FiDroplet size={24} color="#06b6d4" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Intake
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', color: '#fff' }}>
                  {totalMl} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ {targetMl} ml</span>
                </div>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '12px' }}>
              {progressPercent >= 100
                ? '🎉 Fantastic! You achieved your daily hydration target!'
                : `You are ${(targetMl - totalMl)} ml away from hitting your daily hydration target.`}
            </p>

            {/* Linear Bar */}
            <div style={waterStyles.track}>
              <div
                style={{
                  ...waterStyles.bar,
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Presets Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Quick Log Presets</h3>
        <div style={waterStyles.presetGrid}>
          {QUICK_AMOUNTS.map((preset) => (
            <button
              key={preset.ml}
              onClick={() => handleAddWater(preset.ml)}
              className="glass-panel glass-panel-hover"
              style={waterStyles.presetCard}
            >
              <span style={{ fontSize: '2rem' }}>{preset.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                +{preset.ml} ml
              </span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Water Input & Today's Logs */}
      <div style={waterStyles.dualGrid}>
        {/* Custom Input */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Custom Hydration Amount</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddWater(customAmount);
            }}
            style={{ display: 'flex', gap: '12px' }}
          >
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 350 ml"
              min="1"
              max="5000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
              <FiPlus /> Log ml
            </button>
          </form>

          {/* Today's Entries */}
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: '12px' }}>
              Logged Entries for {selectedDate}
            </h4>
            <div style={waterStyles.logsList}>
              {logs.map((log) => (
                <div key={log.id} style={waterStyles.logRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiDroplet color="#06b6d4" />
                    <span style={{ fontWeight: 600, color: '#fff' }}>+{log.amountMl} ml</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {log.loggedAt ? new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    style={waterStyles.trashBtn}
                    title="Remove entry"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              ))}
              {logs.length === 0 && (
                <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', padding: '12px 0' }}>
                  No hydration logged for this date.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 7-Day Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Weekly Hydration Trend</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
            Target: {targetMl} ml / day
          </p>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <ReferenceLine y={targetMl} stroke="#6366f1" strokeDasharray="3 3" />
                <Bar dataKey="amount" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Water (ml)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const waterStyles = {
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
    color: '#06b6d4',
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
  heroPanel: {
    padding: '32px',
  },
  heroContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '36px',
    flexWrap: 'wrap',
  },
  waterCircleOuter: {
    position: 'relative',
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background: 'rgba(6, 182, 212, 0.1)',
    border: '2px solid rgba(6, 182, 212, 0.3)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 25px rgba(6, 182, 212, 0.2)',
  },
  waterCircleInner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.5) 0%, rgba(37, 99, 235, 0.8) 100%)',
    transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  waterCircleText: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroStats: {
    flex: 1,
    minWidth: '240px',
  },
  dropletIconBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    background: 'rgba(6, 182, 212, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '99px',
    marginTop: '16px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
    borderRadius: '99px',
    transition: 'width 0.5s ease',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px',
  },
  presetCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  dualGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '20px',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '220px',
    overflowY: 'auto',
  },
  logRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  trashBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
  },
};
