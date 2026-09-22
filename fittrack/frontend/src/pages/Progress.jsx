import React, { useState, useEffect } from 'react';
import { progressApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FiTrendingUp,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiCheckCircle,
  FiActivity,
  FiX,
} from 'react-icons/fi';

export default function Progress() {
  const [measurements, setMeasurements] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  const [form, setForm] = useState({
    logDate: new Date().toISOString().split('T')[0],
    weightKg: 75.0,
    bodyFatPct: 15.0,
    waistCm: 82,
    chestCm: 102,
    armCm: 37,
    thighCm: 58,
    notes: 'Morning weigh-in after fasting',
  });

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const [allRes, latestRes] = await Promise.all([
        progressApi.getAll(),
        progressApi.getLatest(),
      ]);
      setMeasurements(allRes.data.data || []);
      setLatest(latestRes.data.data || null);
    } catch (err) {
      toast.error('Could not load body progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await progressApi.log({
        logDate: form.logDate,
        weightKg: Number(form.weightKg),
        bodyFatPct: form.bodyFatPct ? Number(form.bodyFatPct) : null,
        waistCm: form.waistCm ? Number(form.waistCm) : null,
        chestCm: form.chestCm ? Number(form.chestCm) : null,
        armCm: form.armCm ? Number(form.armCm) : null,
        thighCm: form.thighCm ? Number(form.thighCm) : null,
        notes: form.notes,
      });
      toast.success('Body measurements logged! 📈');
      setShowLogModal(false);
      fetchProgress();
    } catch (err) {
      toast.error('Could not save measurement');
    }
  };

  const handleDelete = async (id) => {
    try {
      await progressApi.delete(id);
      toast.success('Entry removed');
      fetchProgress();
    } catch (err) {
      toast.error('Could not delete entry');
    }
  };

  // Prepare chart data (sorted chronological)
  const chartData = [...measurements]
    .sort((a, b) => new Date(a.logDate) - new Date(b.logDate))
    .map((m) => ({
      date: m.logDate?.slice(5),
      weight: Number(m.weightKg),
      bodyFat: m.bodyFatPct ? Number(m.bodyFatPct) : null,
    }));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={progStyles.headerRow}>
        <div>
          <div style={progStyles.subTitle}>BODY METRICS & COMPOSITION</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Body Progress & Weight</h1>
        </div>

        <button onClick={() => setShowLogModal(true)} className="btn btn-primary">
          <FiPlus /> Log Body Measurement
        </button>
      </div>

      {/* Latest Metrics Stat Cards Grid */}
      <div style={progStyles.statCardsGrid}>
        <div className="glass-panel" style={progStyles.statCard}>
          <span style={progStyles.statLabel}>Current Weight</span>
          <div style={progStyles.statNumber}>
            {latest?.weightKg ? `${latest.weightKg} kg` : '--'}
          </div>
          <span style={progStyles.statSub}>
            {latest?.logDate ? `Logged ${latest.logDate}` : 'No entries yet'}
          </span>
        </div>

        <div className="glass-panel" style={progStyles.statCard}>
          <span style={progStyles.statLabel}>Body Fat</span>
          <div style={{ ...progStyles.statNumber, color: '#38bdf8' }}>
            {latest?.bodyFatPct ? `${latest.bodyFatPct}%` : '--'}
          </div>
          <span style={progStyles.statSub}>Calculated / calipers</span>
        </div>

        <div className="glass-panel" style={progStyles.statCard}>
          <span style={progStyles.statLabel}>Waist</span>
          <div style={{ ...progStyles.statNumber, color: '#818cf8' }}>
            {latest?.waistCm ? `${latest.waistCm} cm` : '--'}
          </div>
          <span style={progStyles.statSub}>Abdominal circumference</span>
        </div>

        <div className="glass-panel" style={progStyles.statCard}>
          <span style={progStyles.statLabel}>Chest & Arms</span>
          <div style={{ ...progStyles.statNumber, color: '#f43f5e' }}>
            {latest?.armCm ? `${latest.armCm} cm` : '--'}
          </div>
          <span style={progStyles.statSub}>
            Chest: {latest?.chestCm ? `${latest.chestCm} cm` : '--'}
          </span>
        </div>
      </div>

      {/* Weight Trend Chart */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Weight Progression Trend</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
              Historical weight over time
            </p>
          </div>
          <span className="badge badge-primary">Metric (KG)</span>
        </div>

        <div style={{ height: '280px', width: '100%' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis
                  stroke="#64748b"
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#weightGrad)"
                  name="Weight (kg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              No historical data yet. Log your first measurement above!
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '16px' }}>
          Measurement History
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={progStyles.th}>DATE</th>
                <th style={progStyles.th}>WEIGHT</th>
                <th style={progStyles.th}>BODY FAT</th>
                <th style={progStyles.th}>WAIST</th>
                <th style={progStyles.th}>ARMS</th>
                <th style={progStyles.th}>CHEST</th>
                <th style={progStyles.th}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={progStyles.td}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{m.logDate}</span>
                  </td>
                  <td style={progStyles.td}>{m.weightKg} kg</td>
                  <td style={progStyles.td}>{m.bodyFatPct ? `${m.bodyFatPct}%` : '--'}</td>
                  <td style={progStyles.td}>{m.waistCm ? `${m.waistCm} cm` : '--'}</td>
                  <td style={progStyles.td}>{m.armCm ? `${m.armCm} cm` : '--'}</td>
                  <td style={progStyles.td}>{m.chestCm ? `${m.chestCm} cm` : '--'}</td>
                  <td style={progStyles.td}>
                    <button
                      onClick={() => handleDelete(m.id)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                      title="Delete Entry"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {measurements.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No measurement records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Measurement Modal */}
      {showLogModal && (
        <div style={progStyles.modalOverlay}>
          <div className="glass-panel" style={progStyles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem' }}>Record Body Measurement</h2>
              <button onClick={() => setShowLogModal(false)} style={progStyles.closeBtn}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.logDate}
                  onChange={(e) => setForm({ ...form, logDate: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Weight (kg)*</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={form.weightKg}
                    onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={form.bodyFatPct}
                    onChange={(e) => setForm({ ...form, bodyFatPct: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={form.waistCm}
                    onChange={(e) => setForm({ ...form, waistCm: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={form.armCm}
                    onChange={(e) => setForm({ ...form, armCm: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={form.chestCm}
                    onChange={(e) => setForm({ ...form, chestCm: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                <FiCheckCircle /> Save Measurement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const progStyles = {
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
  statCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  statCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statLabel: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 800,
    fontFamily: 'Outfit',
    color: '#fff',
  },
  statSub: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  th: {
    padding: '10px 12px',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  td: {
    padding: '12px',
    fontSize: '0.88rem',
    color: '#94a3b8',
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
    maxWidth: '520px',
    padding: '28px',
    background: '#111726',
    borderRadius: '20px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
  },
};
