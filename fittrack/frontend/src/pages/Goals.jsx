import React, { useState, useEffect } from 'react';
import { goalApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiTarget,
  FiPlus,
  FiCheckCircle,
  FiTrash2,
  FiEdit2,
  FiCalendar,
  FiAward,
  FiX,
} from 'react-icons/fi';

const GOAL_TYPES = [
  { value: 'WEIGHT', label: 'Weight Target', unit: 'kg' },
  { value: 'STRENGTH', label: 'Strength / 1RM PR', unit: 'kg' },
  { value: 'WORKOUT_CONSISTENCY', label: 'Workout Days / Week', unit: 'days' },
  { value: 'PROTEIN_CONSISTENCY', label: 'Protein Target', unit: 'g' },
  { value: 'WATER_CONSISTENCY', label: 'Hydration Target', unit: 'ml' },
  { value: 'SLEEP', label: 'Sleep Recovery', unit: 'hrs' },
  { value: 'CUSTOM', label: 'Custom Goal', unit: '' },
];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState({
    goalType: 'WEIGHT',
    title: 'Reach 72 kg Target Weight',
    description: 'Lean cut with high protein intake',
    currentValue: 75.5,
    targetValue: 72.0,
    unit: 'kg',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await goalApi.getAll();
      setGoals(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load fitness goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setForm({
      goalType: 'WEIGHT',
      title: '',
      description: '',
      currentValue: '',
      targetValue: '',
      unit: 'kg',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (g) => {
    setEditingGoal(g);
    setForm({
      goalType: g.goalType || 'WEIGHT',
      title: g.title,
      description: g.description || '',
      currentValue: g.currentValue,
      targetValue: g.targetValue,
      unit: g.unit || '',
      startDate: g.startDate || '',
      targetDate: g.targetDate || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await goalApi.update(editingGoal.id, {
          ...form,
          currentValue: Number(form.currentValue),
          targetValue: Number(form.targetValue),
        });
        toast.success('Goal updated successfully!');
      } else {
        await goalApi.create({
          ...form,
          currentValue: Number(form.currentValue),
          targetValue: Number(form.targetValue),
        });
        toast.success('New Fitness Goal Created! 🎯');
      }
      setShowModal(false);
      fetchGoals();
    } catch (err) {
      toast.error('Could not save goal');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await goalApi.delete(id);
      toast.success('Goal deleted');
      fetchGoals();
    } catch (err) {
      toast.error('Could not delete goal');
    }
  };

  const calculatePct = (g) => {
    if (!g.targetValue || Number(g.targetValue) === 0) return 0;
    const cur = Number(g.currentValue || 0);
    const tar = Number(g.targetValue);
    return Math.min(100, Math.max(0, Math.round((cur / tar) * 100)));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={goalStyles.headerRow}>
        <div>
          <div style={goalStyles.subTitle}>TARGETS & MILESTONES</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Fitness Goals</h1>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <FiPlus /> Create New Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div style={goalStyles.grid}>
        {goals.map((g) => {
          const pct = calculatePct(g);
          const isDone = g.isCompleted || pct >= 100;

          return (
            <div
              key={g.id}
              className="glass-panel glass-panel-hover"
              style={{
                ...goalStyles.card,
                borderColor: isDone ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.08)',
              }}
            >
              <div style={goalStyles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      ...goalStyles.iconBadge,
                      background: isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                      color: isDone ? '#10b981' : '#818cf8',
                    }}
                  >
                    <FiTarget size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{g.title}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
                      {g.goalType?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenEdit(g)}
                    style={goalStyles.actionBtn}
                    title="Update Progress"
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    style={goalStyles.actionBtn}
                    title="Delete Goal"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>

              {g.description && (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {g.description}
                </p>
              )}

              {/* Progress Values */}
              <div style={goalStyles.valRow}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CURRENT</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: '#fff' }}>
                    {g.currentValue} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{g.unit}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>TARGET</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: '#818cf8' }}>
                    {g.targetValue} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{g.unit}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={goalStyles.track}>
                <div
                  style={{
                    ...goalStyles.bar,
                    width: `${pct}%`,
                    background: isDone
                      ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                      : 'linear-gradient(90deg, #6366f1, #ec4899)',
                  }}
                />
              </div>

              {/* Footer */}
              <div style={goalStyles.cardFooter}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCalendar size={13} /> Target: {g.targetDate || 'Ongoing'}
                </span>
                {isDone ? (
                  <span className="badge badge-success">
                    <FiAward size={13} /> Completed
                  </span>
                ) : (
                  <span className="badge badge-primary">{pct}% Complete</span>
                )}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div
            className="glass-panel"
            style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center' }}
          >
            <FiTarget size={40} color="#818cf8" style={{ marginBottom: '14px' }} />
            <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>No Active Fitness Goals</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '6px auto 20px auto', maxWidth: '400px' }}>
              Create targeted objectives for weight, strength, hydration, or workout frequency.
            </p>
            <button onClick={handleOpenCreate} className="btn btn-primary">
              <FiPlus /> Set Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {showModal && (
        <div style={goalStyles.modalOverlay}>
          <div className="glass-panel" style={goalStyles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem' }}>
                {editingGoal ? 'Update Fitness Goal' : 'Create New Fitness Goal'}
              </h2>
              <button onClick={() => setShowModal(false)} style={goalStyles.closeBtn}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Goal Category</label>
                <select
                  className="form-select"
                  value={form.goalType}
                  onChange={(e) => {
                    const sel = GOAL_TYPES.find((t) => t.value === e.target.value);
                    setForm({
                      ...form,
                      goalType: e.target.value,
                      unit: sel?.unit || form.unit,
                    });
                  }}
                >
                  {GOAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bench Press 100 kg"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Current</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={form.currentValue}
                    onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={form.targetValue}
                    onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="kg, reps, ml"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Strategy</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                <FiCheckCircle /> {editingGoal ? 'Save Updates' : 'Create Goal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const goalStyles = {
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
  },
  valRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  track: {
    width: '100%',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.4s ease',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#64748b',
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
