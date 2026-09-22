import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiBarChart2,
  FiTrendingUp,
  FiActivity,
  FiDroplet,
  FiMoon,
  FiCalendar,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (d) => {
    setLoading(true);
    try {
      const res = await analyticsApi.get(d);
      setAnalytics(res.data.data);
    } catch (err) {
      toast.error('Could not load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  const trends = analytics?.trends || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={anStyles.headerRow}>
        <div>
          <div style={anStyles.subTitle}>LONG-TERM METRICS & INSIGHTS</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Analytics & Trends</h1>
        </div>

        {/* Days Selector */}
        <div style={anStyles.timeframeSelector}>
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                ...anStyles.tfBtn,
                ...(days === d ? anStyles.tfBtnActive : {}),
              }}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={anStyles.kpiGrid}>
        <div className="glass-panel" style={anStyles.kpiCard}>
          <span style={anStyles.kpiLabel}>AVERAGE CALORIES</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {analytics?.averageDailyCalories ? Math.round(analytics.averageDailyCalories) : 0}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>kcal/day</span>
          </div>
        </div>

        <div className="glass-panel" style={anStyles.kpiCard}>
          <span style={anStyles.kpiLabel}>AVERAGE PROTEIN</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#818cf8' }}>
              {analytics?.averageDailyProtein ? analytics.averageDailyProtein.toFixed(1) : 0}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>g/day</span>
          </div>
        </div>

        <div className="glass-panel" style={anStyles.kpiCard}>
          <span style={anStyles.kpiLabel}>HYDRATION CONSISTENCY</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
              {analytics?.hydrationTargetComplianceRate ? `${analytics.hydrationTargetComplianceRate.toFixed(0)}%` : '0%'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>target hit</span>
          </div>
        </div>

        <div className="glass-panel" style={anStyles.kpiCard}>
          <span style={anStyles.kpiLabel}>WORKOUT SESSIONS</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
              {analytics?.totalWorkoutSessions || 0}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>completed</span>
          </div>
        </div>

        <div className="glass-panel" style={anStyles.kpiCard}>
          <span style={anStyles.kpiLabel}>AVERAGE SLEEP</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7' }}>
              {analytics?.averageSleepHours ? analytics.averageSleepHours.toFixed(1) : 0}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>hours/night</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Calorie & Protein Intake Over Time */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '4px' }}>
          Calorie & Protein Intake Progression
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
          Daily nutritional volume tracked across the selected {days}-day window.
        </p>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(d) => d?.slice(5)}
              />
              <YAxis yAxisId="cal" stroke="#64748b" fontSize={12} />
              <YAxis yAxisId="pro" orientation="right" stroke="#818cf8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#090d16',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                yAxisId="cal"
                type="monotone"
                dataKey="calories"
                name="Calories (kcal)"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="pro"
                type="monotone"
                dataKey="proteinG"
                name="Protein (g)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Hydration & Sleep Duration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Hydration Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FiDroplet style={{ color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Hydration Intake (ml)</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
            Consistency toward your daily water target.
          </p>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(d) => d?.slice(5)} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#090d16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="waterMl" name="Water (ml)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Duration Area Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FiMoon style={{ color: '#a855f7' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Sleep & Recovery (Hours)</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
            Overnight sleep duration with midnight crossover correction.
          </p>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(d) => d?.slice(5)} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 12]} />
                <Tooltip contentStyle={{ background: '#090d16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="sleepHours"
                  name="Sleep (Hours)"
                  stroke="#a855f7"
                  fill="rgba(168, 85, 247, 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const anStyles = {
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
  timeframeSelector: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    padding: '4px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tfBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  tfBtnActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#fff',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  kpiLabel: {
    fontSize: '0.74rem',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.08em',
  },
};
